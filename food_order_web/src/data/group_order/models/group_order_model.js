import { GroupOrderEntity } from '../../../domain/group_order/entities/group_order_entity';
import { GroupMemberEntity } from '../../../domain/group_order/entities/group_member_entity';
import { GroupItemEntity } from '../../../domain/group_order/entities/group_item_entity';

export class GroupOrderModel {
  static fromJson(source = {}) {
    if (!source) return null;
    const raw = source.groupOrder || source;

    const members = Array.isArray(raw.members)
      ? raw.members.map(
          (m) =>
            new GroupMemberEntity({
              id: m.id || m.memberId || m._id,
              name: m.name || 'Friend',
              avatar: m.avatar || '',
              color: m.color || '#f97316',
              isHost: Boolean(m.isHost),
              joinedAt: m.joinedAt ? new Date(m.joinedAt) : new Date(),
            })
        )
      : [];

    const items = Array.isArray(raw.items)
      ? raw.items.map(
          (i) =>
            new GroupItemEntity({
              id: i.itemId || i.id || i._id,
              foodId: i.foodId || i.food?._id || i.food?.id || i.food,
              foodName: i.foodName || i.name || i.food?.name || i.food?.title || 'Dish',
              foodImageUrl: i.foodImageUrl || i.image || i.food?.imageUrl || '',
              price: Number(i.price) || 0,
              quantity: Number(i.quantity) || 1,
              notes: i.notes || '',
              memberId: i.memberId || i.addedBy?.id || '',
              memberName: i.memberName || i.addedBy?.name || 'Participant',
              memberColor: i.memberColor || i.addedBy?.color || '#f97316',
            })
        )
      : [];

    return new GroupOrderEntity({
      id: raw.groupId || raw.id || raw._id || `grp_${Date.now()}`,
      code: raw.code || '',
      title: raw.title || 'Group Order',
      hostId: raw.hostId || raw.host?.userId || raw.host?.id || '',
      hostName: raw.hostName || raw.host?.name || 'Host',
      isLocked: raw.status === 'locked' || Boolean(raw.isLocked),
      status: raw.status || (raw.isLocked ? 'locked' : 'active'),
      members,
      items,
      createdAt: raw.createdAt ? new Date(raw.createdAt) : new Date(),
      updatedAt: raw.updatedAt ? new Date(raw.updatedAt) : new Date(),
      spendingLimit: raw.spendingLimit || raw.spendingLimitPerPerson || null,
      finalOrderId: raw.finalOrderId || null,
    });
  }


  static toJson(entity) {
    if (!entity) return null;

    return {
      id: entity.id,
      code: entity.code,
      title: entity.title,
      hostId: entity.hostId,
      hostName: entity.hostName,
      isLocked: entity.isLocked,
      members: entity.members.map((m) => ({
        id: m.id,
        name: m.name,
        avatar: m.avatar,
        color: m.color,
        isHost: m.isHost,
        joinedAt: m.joinedAt.toISOString(),
      })),
      items: entity.items.map((i) => ({
        id: i.id,
        foodId: i.foodId,
        foodName: i.foodName,
        foodImageUrl: i.foodImageUrl,
        price: i.price,
        quantity: i.quantity,
        notes: i.notes,
        memberId: i.memberId,
        memberName: i.memberName,
        memberColor: i.memberColor,
      })),
      createdAt: entity.createdAt.toISOString(),
      updatedAt: entity.updatedAt.toISOString(),
      spendingLimit: entity.spendingLimit,
    };
  }
}
