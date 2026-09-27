import { GroupOrderRepository } from '../../../domain/group_order/repositories/group_order_repository';
import { GroupOrderEntity } from '../../../domain/group_order/entities/group_order_entity';
import { GroupMemberEntity, MEMBER_AVATAR_COLORS } from '../../../domain/group_order/entities/group_member_entity';
import { GroupItemEntity } from '../../../domain/group_order/entities/group_item_entity';
import { GroupOrderLocalDataSource } from '../datasources/group_order_local_datasource';
import { socketService } from '../../../core/services/socket_service';

export class GroupOrderRepositoryImpl extends GroupOrderRepository {
  constructor({ localDataSource = new GroupOrderLocalDataSource() } = {}) {
    super();
    this.localDataSource = localDataSource;
  }

  getCurrentMember() {
    return this.localDataSource.getCurrentMember();
  }

  saveCurrentMember(member) {
    this.localDataSource.saveCurrentMember(member);
  }

  async getActiveGroupOrder() {
    return this.localDataSource.getActiveGroupOrder();
  }

  async createGroupOrder({ title = 'Group Feast', hostMember }) {
    const memberColor =
      hostMember.color ||
      MEMBER_AVATAR_COLORS[Math.floor(Math.random() * MEMBER_AVATAR_COLORS.length)];

    const host = new GroupMemberEntity({
      id: hostMember.id || `host_${Date.now()}`,
      name: hostMember.name || 'Group Host',
      avatar: hostMember.avatar || '',
      color: memberColor,
      isHost: true,
      joinedAt: new Date(),
    });

    // 6-character room code (e.g. BC-9281)
    const randomCode = `BC-${Math.floor(1000 + Math.random() * 9000)}`;

    const newGroup = new GroupOrderEntity({
      id: `grp_${Date.now()}`,
      code: randomCode,
      title: title || 'Group Feast',
      hostId: host.id,
      hostName: host.name,
      isLocked: false,
      members: [host],
      items: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    this.localDataSource.saveGroupOrder(newGroup);
    this.localDataSource.saveCurrentMember(host);

    // Join socket room
    try {
      socketService.emit('group:join', { groupId: newGroup.id, member: host });
    } catch (e) {
      console.warn('Socket error on group create:', e);
    }

    return newGroup;
  }

  async joinGroupOrder({ code, member }) {
    const formattedCode = (code || '').trim().toUpperCase();
    let currentGroup = this.localDataSource.getActiveGroupOrder();

    // If joining an existing room or creating a simulated room matching the code
    if (!currentGroup || currentGroup.code !== formattedCode) {
      currentGroup = new GroupOrderEntity({
        id: `grp_${formattedCode.replace(/[^A-Z0-9]/gi, '')}`,
        code: formattedCode,
        title: 'Team Shared Order',
        hostId: 'host_shared',
        hostName: 'Team Leader',
        isLocked: false,
        members: [
          new GroupMemberEntity({
            id: 'host_shared',
            name: 'Team Leader',
            color: '#f97316',
            isHost: true,
          }),
        ],
        items: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    // Check if member already in group
    const existingIdx = currentGroup.members.findIndex(
      (m) => m.name.toLowerCase() === member.name.toLowerCase() || m.id === member.id
    );

    let joinedMember;
    const updatedMembers = [...currentGroup.members];

    if (existingIdx >= 0) {
      joinedMember = updatedMembers[existingIdx];
    } else {
      const color =
        member.color ||
        MEMBER_AVATAR_COLORS[
          updatedMembers.length % MEMBER_AVATAR_COLORS.length
        ];

      joinedMember = new GroupMemberEntity({
        id: member.id || `member_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        name: member.name,
        avatar: member.avatar || '',
        color,
        isHost: false,
        joinedAt: new Date(),
      });
      updatedMembers.push(joinedMember);
    }

    const updatedGroup = new GroupOrderEntity({
      ...currentGroup,
      members: updatedMembers,
      updatedAt: new Date(),
    });

    this.localDataSource.saveGroupOrder(updatedGroup);
    this.localDataSource.saveCurrentMember(joinedMember);

    // Emit socket join
    try {
      socketService.emit('group:join', { groupId: updatedGroup.id, member: joinedMember });
      socketService.emit('group:sync', { groupId: updatedGroup.id, groupOrder: updatedGroup });
    } catch (e) {
      console.warn('Socket error on group join:', e);
    }

    return updatedGroup;
  }

  async addMemberItem({ groupId, item }) {
    const currentGroup = this.localDataSource.getActiveGroupOrder();
    if (!currentGroup || currentGroup.id !== groupId) {
      throw new Error('No active group order found with this ID.');
    }

    if (currentGroup.isLocked) {
      throw new Error('This group order is locked by the host. No more items can be added.');
    }

    const newItem = new GroupItemEntity(item);
    const existingItemIdx = currentGroup.items.findIndex(
      (i) => i.foodId === newItem.foodId && i.memberId === newItem.memberId && i.notes === newItem.notes
    );

    let updatedItems = [...currentGroup.items];
    if (existingItemIdx >= 0) {
      const existing = updatedItems[existingItemIdx];
      updatedItems[existingItemIdx] = new GroupItemEntity({
        ...existing,
        quantity: existing.quantity + (newItem.quantity || 1),
      });
    } else {
      updatedItems.push(newItem);
    }

    const updatedGroup = new GroupOrderEntity({
      ...currentGroup,
      items: updatedItems,
      updatedAt: new Date(),
    });

    this.localDataSource.saveGroupOrder(updatedGroup);

    // Broadcast sync
    try {
      socketService.emit('group:sync', { groupId: updatedGroup.id, groupOrder: updatedGroup });
    } catch (e) {
      console.warn('Socket sync error:', e);
    }

    return updatedGroup;
  }

  async removeMemberItem({ groupId, itemId, memberId }) {
    const currentGroup = this.localDataSource.getActiveGroupOrder();
    if (!currentGroup || currentGroup.id !== groupId) return null;

    if (currentGroup.isLocked) {
      throw new Error('Order is locked by host and cannot be modified.');
    }

    const updatedItems = currentGroup.items.filter((it) => {
      if (it.id === itemId) {
        // Can be removed if caller is host or caller is the owner of the item
        if (memberId && it.memberId && it.memberId !== memberId) {
          const caller = currentGroup.members.find((m) => m.id === memberId);
          if (!caller?.isHost) return true;
        }
        return false;
      }
      return true;
    });

    const updatedGroup = new GroupOrderEntity({
      ...currentGroup,
      items: updatedItems,
      updatedAt: new Date(),
    });

    this.localDataSource.saveGroupOrder(updatedGroup);

    try {
      socketService.emit('group:sync', { groupId: updatedGroup.id, groupOrder: updatedGroup });
    } catch (e) {
      console.warn('Socket sync error:', e);
    }

    return updatedGroup;
  }

  async lockGroupOrder({ groupId, isLocked }) {
    const currentGroup = this.localDataSource.getActiveGroupOrder();
    if (!currentGroup || currentGroup.id !== groupId) return null;

    const updatedGroup = new GroupOrderEntity({
      ...currentGroup,
      isLocked: Boolean(isLocked),
      updatedAt: new Date(),
    });

    this.localDataSource.saveGroupOrder(updatedGroup);

    try {
      socketService.emit('group:lock', { groupId, isLocked: Boolean(isLocked) });
      socketService.emit('group:sync', { groupId: updatedGroup.id, groupOrder: updatedGroup });
    } catch (e) {
      console.warn('Socket lock error:', e);
    }

    return updatedGroup;
  }

  async leaveGroupOrder({ groupId, memberId }) {
    try {
      socketService.emit('group:leave', { groupId, memberId });
    } catch (e) {
      console.warn('Socket leave error:', e);
    }

    this.localDataSource.clearGroupOrder();
  }
}
