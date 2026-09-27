const GroupOrder = require('../models/groupOrderModel');
const { getIO } = require('../socket/socketManager');

const emitGroupEvent = (groupId, eventName, payload) => {
  try {
    const io = getIO();
    if (io) {
      io.to(`group_${groupId}`).emit(eventName, payload);
    }
  } catch (err) {
    console.debug(`[Socket] Group event ${eventName} skipped:`, err.message);
  }
};

const createGroupOrder = async ({ hostId, hostName, hostAvatar, title, spendingLimitPerPerson, deliveryAddress }) => {
  const groupId = `grp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const hostMember = {
    id: hostId || `host_${Date.now()}`,
    name: hostName || 'Host',
    avatar: hostAvatar || '',
    isHost: true,
    joinedAt: new Date(),
  };

  const groupOrder = new GroupOrder({
    groupId,
    title: title || 'Team Lunch Order',
    host: {
      userId: hostMember.id,
      name: hostMember.name,
      avatar: hostMember.avatar,
    },
    members: [hostMember],
    items: [],
    status: 'active',
    spendingLimitPerPerson: spendingLimitPerPerson || null,
    deliveryAddress: deliveryAddress || '',
  });

  await groupOrder.save();
  return groupOrder;
};

const getGroupOrder = async (groupId) => {
  const groupOrder = await GroupOrder.findOne({ groupId });
  if (!groupOrder) {
    throw new Error('Group order not found');
  }
  return groupOrder;
};

const joinGroupOrder = async (groupId, { memberId, name, avatar }) => {
  const groupOrder = await getGroupOrder(groupId);
  if (groupOrder.status === 'locked') {
    throw new Error('Group order is locked by the host');
  }

  const existing = groupOrder.members.find((m) => m.id === memberId || m.name.toLowerCase() === (name || '').toLowerCase());
  if (!existing) {
    const newMember = {
      id: memberId || `member_${Date.now()}`,
      name: name || 'Colleague',
      avatar: avatar || '',
      isHost: false,
      joinedAt: new Date(),
    };
    groupOrder.members.push(newMember);
    await groupOrder.save();

    emitGroupEvent(groupId, 'group:member_joined', { member: newMember, groupOrder });
  }

  return groupOrder;
};

const leaveGroupOrder = async (groupId, memberId) => {
  const groupOrder = await getGroupOrder(groupId);

  groupOrder.members = groupOrder.members.filter((m) => m.id !== memberId);
  groupOrder.items = groupOrder.items.filter((item) => item.addedBy?.id !== memberId);

  await groupOrder.save();
  emitGroupEvent(groupId, 'group:member_left', { memberId, groupOrder });

  return groupOrder;
};

const addItemToGroup = async (groupId, itemData) => {
  const groupOrder = await getGroupOrder(groupId);
  if (groupOrder.status === 'locked') {
    throw new Error('Group cart is locked. No new items can be added.');
  }

  const newItem = {
    itemId: itemData.itemId || `item_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
    foodId: itemData.foodId || itemData.id,
    name: itemData.name || itemData.foodName || 'Dish',
    price: Number(itemData.price || 0),
    quantity: Number(itemData.quantity || 1),
    image: itemData.image || '',
    addedBy: {
      id: itemData.addedBy?.id || 'guest',
      name: itemData.addedBy?.name || 'Someone',
      avatar: itemData.addedBy?.avatar || '',
    },
    notes: itemData.notes || '',
  };

  groupOrder.items.push(newItem);
  await groupOrder.save();

  emitGroupEvent(groupId, 'group:updated', groupOrder);
  return groupOrder;
};

const removeItemFromGroup = async (groupId, itemId) => {
  const groupOrder = await getGroupOrder(groupId);
  if (groupOrder.status === 'locked') {
    throw new Error('Group cart is locked.');
  }

  groupOrder.items = groupOrder.items.filter((it) => it.itemId !== itemId);
  await groupOrder.save();

  emitGroupEvent(groupId, 'group:updated', groupOrder);
  return groupOrder;
};

const setLockStatus = async (groupId, isLocked) => {
  const groupOrder = await getGroupOrder(groupId);
  groupOrder.status = isLocked ? 'locked' : 'active';
  await groupOrder.save();

  emitGroupEvent(groupId, 'group:locked', { groupId, isLocked, status: groupOrder.status });
  emitGroupEvent(groupId, 'group:updated', groupOrder);
  return groupOrder;
};

module.exports = {
  createGroupOrder,
  getGroupOrder,
  joinGroupOrder,
  leaveGroupOrder,
  addItemToGroup,
  removeItemFromGroup,
  setLockStatus,
};
