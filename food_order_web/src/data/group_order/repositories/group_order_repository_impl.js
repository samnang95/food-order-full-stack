import { GroupOrderRepository } from '../../../domain/group_order/repositories/group_order_repository';
import { GroupOrderEntity } from '../../../domain/group_order/entities/group_order_entity';
import { GroupMemberEntity, MEMBER_AVATAR_COLORS } from '../../../domain/group_order/entities/group_member_entity';
import { GroupItemEntity } from '../../../domain/group_order/entities/group_item_entity';
import { GroupOrderLocalDataSource } from '../datasources/group_order_local_datasource';
import { GroupOrderRemoteDataSource } from '../datasources/group_order_remote_datasource';
import { socketService } from '../../../core/services/socket_service';

export class GroupOrderRepositoryImpl extends GroupOrderRepository {
  constructor({
    localDataSource = new GroupOrderLocalDataSource(),
    remoteDataSource = new GroupOrderRemoteDataSource(),
  } = {}) {
    super();
    this.localDataSource = localDataSource;
    this.remoteDataSource = remoteDataSource;
  }

  getCurrentMember() {
    return this.localDataSource.getCurrentMember();
  }

  saveCurrentMember(member) {
    this.localDataSource.saveCurrentMember(member);
  }

  async getActiveGroupOrder() {
    const local = this.localDataSource.getActiveGroupOrder();
    if (local?.id) {
      try {
        const remote = await this.remoteDataSource.getGroupOrder(local.id);
        if (remote) {
          const synced = new GroupOrderEntity({
            id: remote.groupId || remote.id,
            code: local.code,
            title: remote.title || local.title,
            hostId: remote.host?.userId || local.hostId,
            hostName: remote.host?.name || local.hostName,
            isLocked: remote.status === 'locked' || local.isLocked,
            members: (remote.members || []).map((m) => new GroupMemberEntity(m)),
            items: (remote.items || []).map((i) => new GroupItemEntity(i)),
            createdAt: remote.createdAt || local.createdAt,
            updatedAt: remote.updatedAt || local.updatedAt,
          });
          this.localDataSource.saveGroupOrder(synced);
          return synced;
        }
      } catch (err) {
        console.debug('Using local group order fallback:', err.message);
      }
    }
    return local;
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

    const randomCode = `BC-${Math.floor(1000 + Math.random() * 9000)}`;
    const groupId = `grp_${Date.now()}`;

    let newGroup = new GroupOrderEntity({
      id: groupId,
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

    // Call backend API in parallel and update if successful
    try {
      const remote = await this.remoteDataSource.createGroupOrder({
        groupId,
        code: randomCode,
        title: newGroup.title,
        hostId: host.id,
        hostName: host.name,
        hostAvatar: host.avatar,
        hostColor: host.color,
      });
      if (remote) {
        const parsed = GroupOrderModel.fromJson(remote);
        if (parsed) {
          newGroup = parsed;
          this.localDataSource.saveGroupOrder(newGroup);
        }
      }
    } catch (e) {
      console.debug('Backend group creation note:', e.message);
    }

    // Join real-time socket room
    try {
      socketService.emit('group:join', { groupId: newGroup.id, member: host });
    } catch (e) {
      console.warn('Socket error on group create:', e);
    }

    return newGroup;
  }

  async joinGroupOrder({ code, member }) {
    const formattedCode = (code || '').trim().toUpperCase();
    let currentGroup = null;

    // 1. First attempt to fetch the live group from the backend by code or ID
    try {
      const remote = await this.remoteDataSource.getGroupOrder(formattedCode);
      if (remote) {
        currentGroup = GroupOrderModel.fromJson(remote);
      }
    } catch (err) {
      console.debug('Could not fetch remote group by code, trying local fallback:', err.message);
    }

    // 2. Fall back to local storage if API is unreachable
    if (!currentGroup) {
      currentGroup = this.localDataSource.getActiveGroupOrder();
    }

    if (!currentGroup || (currentGroup.code !== formattedCode && currentGroup.id !== formattedCode)) {
      const generatedId = `grp_${formattedCode.replace(/[^A-Z0-9]/gi, '')}`;
      currentGroup = new GroupOrderEntity({
        id: generatedId,
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

    let updatedGroup = new GroupOrderEntity({
      ...currentGroup,
      members: updatedMembers,
      updatedAt: new Date(),
    });

    this.localDataSource.saveGroupOrder(updatedGroup);
    this.localDataSource.saveCurrentMember(joinedMember);

    // Call backend API
    try {
      const remote = await this.remoteDataSource.joinGroupOrder(updatedGroup.id, {
        memberId: joinedMember.id,
        name: joinedMember.name,
        avatar: joinedMember.avatar,
        color: joinedMember.color,
      });
      if (remote) {
        const parsed = GroupOrderModel.fromJson(remote);
        if (parsed) {
          updatedGroup = parsed;
          this.localDataSource.saveGroupOrder(updatedGroup);
        }
      }
    } catch (e) {
      console.debug('Backend group join note:', e.message);
    }

    // Emit socket join & sync
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

    let updatedGroup = new GroupOrderEntity({
      ...currentGroup,
      items: updatedItems,
      updatedAt: new Date(),
    });

    this.localDataSource.saveGroupOrder(updatedGroup);

    // Call backend API
    try {
      const remote = await this.remoteDataSource.addItem(groupId, {
        itemId: newItem.id,
        foodId: newItem.foodId,
        name: newItem.foodName,
        price: newItem.price,
        quantity: newItem.quantity,
        image: newItem.foodImageUrl,
        addedBy: {
          id: newItem.memberId,
          name: newItem.memberName,
          color: newItem.memberColor,
        },
        notes: newItem.notes,
      });
      if (remote) {
        const parsed = GroupOrderModel.fromJson(remote);
        if (parsed) {
          updatedGroup = parsed;
          this.localDataSource.saveGroupOrder(updatedGroup);
        }
      }
    } catch (e) {
      console.debug('Backend add item note:', e.message);
    }

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
        if (memberId && it.memberId && it.memberId !== memberId) {
          const caller = currentGroup.members.find((m) => m.id === memberId);
          if (!caller?.isHost) return true;
        }
        return false;
      }
      return true;
    });

    let updatedGroup = new GroupOrderEntity({
      ...currentGroup,
      items: updatedItems,
      updatedAt: new Date(),
    });

    this.localDataSource.saveGroupOrder(updatedGroup);

    // Call backend API
    try {
      const remote = await this.remoteDataSource.removeItem(groupId, itemId);
      if (remote) {
        const parsed = GroupOrderModel.fromJson(remote);
        if (parsed) {
          updatedGroup = parsed;
          this.localDataSource.saveGroupOrder(updatedGroup);
        }
      }
    } catch (e) {
      console.debug('Backend remove item note:', e.message);
    }

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

    let updatedGroup = new GroupOrderEntity({
      ...currentGroup,
      isLocked: Boolean(isLocked),
      status: isLocked ? 'locked' : 'active',
      updatedAt: new Date(),
    });

    this.localDataSource.saveGroupOrder(updatedGroup);

    // Call backend API
    try {
      const remote = await this.remoteDataSource.lockGroupOrder(groupId, Boolean(isLocked));
      if (remote) {
        const parsed = GroupOrderModel.fromJson(remote);
        if (parsed) {
          updatedGroup = parsed;
          this.localDataSource.saveGroupOrder(updatedGroup);
        }
      }
    } catch (e) {
      console.debug('Backend lock note:', e.message);
    }

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
      await this.remoteDataSource.leaveGroupOrder(groupId, memberId);
    } catch (e) {
      console.debug('Backend leave group note:', e.message);
    }

    try {
      socketService.emit('group:leave', { groupId, memberId });
    } catch (e) {
      console.warn('Socket leave error:', e);
    }

    this.localDataSource.clearGroupOrder();
  }
}

