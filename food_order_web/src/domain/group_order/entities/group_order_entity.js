import { GroupMemberEntity } from './group_member_entity';
import { GroupItemEntity } from './group_item_entity';

export class GroupOrderEntity {
  constructor({
    id = '',
    code = '',
    title = 'Group Order',
    hostId = '',
    hostName = 'Host',
    isLocked = false,
    status = 'active',
    finalOrderId = null,
    members = [],
    items = [],
    createdAt = new Date(),
    updatedAt = new Date(),
    spendingLimit = null,
  } = {}) {
    this.id = id || `grp_${Date.now()}`;
    this.code = (code || Math.random().toString(36).substring(2, 8)).toUpperCase();
    this.title = title;
    this.hostId = hostId;
    this.hostName = hostName;
    this.status = status;
    this.isLocked = Boolean(isLocked) || status === 'locked';
    this.finalOrderId = finalOrderId;
    this.members = members.map((m) =>
      m instanceof GroupMemberEntity ? m : new GroupMemberEntity(m)
    );
    this.items = items.map((i) =>
      i instanceof GroupItemEntity ? i : new GroupItemEntity(i)
    );
    this.createdAt = createdAt instanceof Date ? createdAt : new Date(createdAt);
    this.updatedAt = updatedAt instanceof Date ? updatedAt : new Date(updatedAt);
    this.spendingLimit = spendingLimit;
  }

  get isOrdered() {
    return this.status === 'ordered';
  }


  get totalSubtotal() {
    return this.items.reduce((sum, it) => sum + it.totalPrice, 0);
  }

  get totalItemsCount() {
    return this.items.reduce((sum, it) => sum + it.quantity, 0);
  }

  get membersCount() {
    return this.members.length;
  }

  getItemsForMember(memberId) {
    return this.items.filter((it) => it.memberId === memberId);
  }

  getMemberSubtotal(memberId) {
    return this.getItemsForMember(memberId).reduce((sum, it) => sum + it.totalPrice, 0);
  }

  /**
   * Computes an equitable split-bill breakdown for all group participants.
   * Splits delivery fee equally among active participants, and discounts/tips proportionally.
   */
  getSplitBillBreakdown({
    deliveryFee = 0,
    discountAmount = 0,
    tipAmount = 0,
    exchangeRate = 4100,
  } = {}) {
    const totalSub = this.totalSubtotal;
    const memberShares = [];
    const activeMembers = this.members;
    const memberCount = Math.max(1, activeMembers.length);

    // Equal share of delivery fee per participant
    const perMemberDelivery = deliveryFee > 0 ? deliveryFee / memberCount : 0;

    for (const member of activeMembers) {
      const memberSub = this.getMemberSubtotal(member.id);
      const memberItems = this.getItemsForMember(member.id);
      const ratio = totalSub > 0 ? memberSub / totalSub : 1 / memberCount;

      const memberDiscount = discountAmount * ratio;
      const memberTip = tipAmount * ratio;
      const memberTotalUsd = Math.max(
        0,
        memberSub + perMemberDelivery + memberTip - memberDiscount
      );
      const memberTotalKhr = Math.round(memberTotalUsd * exchangeRate);

      memberShares.push({
        memberId: member.id,
        memberName: member.name,
        memberColor: member.color,
        isHost: member.id === this.hostId,
        itemsCount: memberItems.reduce((s, it) => s + it.quantity, 0),
        items: memberItems,
        subtotal: memberSub,
        deliveryShare: perMemberDelivery,
        discountShare: memberDiscount,
        tipShare: memberTip,
        totalUsd: memberTotalUsd,
        totalKhr: memberTotalKhr,
        formattedTotalUsd: `$${memberTotalUsd.toFixed(2)}`,
        formattedTotalKhr: `${memberTotalKhr.toLocaleString()} ៛`,
      });
    }

    return {
      groupId: this.id,
      code: this.code,
      title: this.title,
      totalSubtotal: totalSub,
      deliveryFee,
      discountAmount,
      tipAmount,
      totalFinalUsd: Math.max(0, totalSub + deliveryFee + tipAmount - discountAmount),
      totalFinalKhr: Math.round(
        Math.max(0, totalSub + deliveryFee + tipAmount - discountAmount) * exchangeRate
      ),
      memberShares,
    };
  }
}
