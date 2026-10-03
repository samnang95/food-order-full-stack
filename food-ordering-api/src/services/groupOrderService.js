const GroupOrder = require('../models/groupOrderModel');
const { getIO } = require('../socket/socketManager');

const emitGroupEvent = (groupId, eventName, payload) => {
  try {
    const io = getIO();
    if (io) {
      io.to(`group_${groupId}`).emit(eventName, payload);
      // Also broadcast general update if not group:updated
      if (eventName !== 'group:updated') {
        io.to(`group_${groupId}`).emit('group:updated', payload.groupOrder || payload);
      }
    }
  } catch (err) {
    console.debug(`[Socket] Group event ${eventName} skipped:`, err.message);
  }
};

const createGroupOrder = async ({
  hostId,
  hostName,
  hostAvatar,
  hostColor,
  title,
  spendingLimitPerPerson,
  deliveryAddress,
  code: requestedCode,
  groupId: customGroupId,
}) => {
  const groupId = customGroupId || `grp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const code = (requestedCode || `BC-${Math.floor(1000 + Math.random() * 9000)}`).toUpperCase();

  const hostMember = {
    id: hostId || `host_${Date.now()}`,
    name: hostName || 'Host',
    avatar: hostAvatar || '',
    color: hostColor || '#f97316',
    isHost: true,
    joinedAt: new Date(),
  };

  const groupOrder = new GroupOrder({
    groupId,
    code,
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

const getGroupOrder = async (identifier) => {
  if (!identifier) {
    throw new Error('Group identifier is required');
  }

  const query = {
    $or: [
      { groupId: identifier },
      { code: String(identifier).toUpperCase() },
    ],
  };

  const groupOrder = await GroupOrder.findOne(query);
  if (!groupOrder) {
    throw new Error(`Group order '${identifier}' not found`);
  }
  return groupOrder;
};

const joinGroupOrder = async (identifier, { memberId, name, avatar, color }) => {
  const groupOrder = await getGroupOrder(identifier);
  if (groupOrder.status === 'locked') {
    throw new Error('Group order is locked by the host');
  }
  if (groupOrder.status === 'ordered') {
    throw new Error('This group order has already been placed.');
  }

  const existing = groupOrder.members.find(
    (m) => m.id === memberId || m.name.toLowerCase() === (name || '').toLowerCase()
  );

  let memberRecord = existing;
  if (!existing) {
    memberRecord = {
      id: memberId || `member_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      name: name || 'Colleague',
      avatar: avatar || '',
      color: color || '#f97316',
      isHost: false,
      joinedAt: new Date(),
    };
    groupOrder.members.push(memberRecord);
    await groupOrder.save();

    emitGroupEvent(groupOrder.groupId, 'group:member_joined', { member: memberRecord, groupOrder });
  }

  return groupOrder;
};

const leaveGroupOrder = async (identifier, memberId) => {
  const groupOrder = await getGroupOrder(identifier);

  groupOrder.members = groupOrder.members.filter((m) => m.id !== memberId);
  groupOrder.items = groupOrder.items.filter((item) => item.addedBy?.id !== memberId);

  await groupOrder.save();
  emitGroupEvent(groupOrder.groupId, 'group:member_left', { memberId, groupOrder });

  return groupOrder;
};

const addItemToGroup = async (identifier, itemData) => {
  const groupOrder = await getGroupOrder(identifier);
  if (groupOrder.status === 'locked') {
    throw new Error('Group cart is locked. No new items can be added.');
  }
  if (groupOrder.status === 'ordered') {
    throw new Error('This group order has already been placed.');
  }

  const newItem = {
    itemId: itemData.itemId || itemData.id || `item_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
    foodId: itemData.foodId || itemData.food?._id || itemData.food?.id || itemData.id,
    name: itemData.name || itemData.foodName || 'Dish',
    price: Number(itemData.price || 0),
    quantity: Number(itemData.quantity || 1),
    image: itemData.image || itemData.foodImageUrl || '',
    addedBy: {
      id: itemData.addedBy?.id || itemData.memberId || 'guest',
      name: itemData.addedBy?.name || itemData.memberName || 'Someone',
      avatar: itemData.addedBy?.avatar || '',
      color: itemData.addedBy?.color || itemData.memberColor || '#f97316',
    },
    notes: itemData.notes || '',
  };

  // Check if identical item by same member already exists, increment quantity
  const existingIdx = groupOrder.items.findIndex(
    (it) => it.foodId === newItem.foodId && it.addedBy?.id === newItem.addedBy?.id && it.notes === newItem.notes
  );

  if (existingIdx >= 0) {
    groupOrder.items[existingIdx].quantity += newItem.quantity;
  } else {
    groupOrder.items.push(newItem);
  }

  await groupOrder.save();

  emitGroupEvent(groupOrder.groupId, 'group:item_added', { item: newItem, groupOrder });
  return groupOrder;
};

const removeItemFromGroup = async (identifier, itemId) => {
  const groupOrder = await getGroupOrder(identifier);
  if (groupOrder.status === 'locked') {
    throw new Error('Group cart is locked.');
  }

  groupOrder.items = groupOrder.items.filter((it) => it.itemId !== itemId && it.id !== itemId);
  await groupOrder.save();

  emitGroupEvent(groupOrder.groupId, 'group:item_removed', { itemId, groupOrder });
  return groupOrder;
};

const setLockStatus = async (identifier, isLocked) => {
  const groupOrder = await getGroupOrder(identifier);
  groupOrder.status = isLocked ? 'locked' : 'active';
  await groupOrder.save();

  emitGroupEvent(groupOrder.groupId, 'group:locked', {
    groupId: groupOrder.groupId,
    isLocked: Boolean(isLocked),
    status: groupOrder.status,
    groupOrder,
  });
  return groupOrder;
};

const setGroupOrderStatus = async (identifier, status, finalOrderId = null) => {
  const groupOrder = await getGroupOrder(identifier);
  groupOrder.status = status;
  if (finalOrderId) {
    groupOrder.finalOrderId = finalOrderId;
  }
  await groupOrder.save();

  if (status === 'ordered') {
    emitGroupEvent(groupOrder.groupId, 'group:ordered', {
      groupId: groupOrder.groupId,
      orderId: finalOrderId,
      status: groupOrder.status,
      groupOrder,
    });
  } else {
    emitGroupEvent(groupOrder.groupId, 'group:updated', groupOrder);
  }

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
  setGroupOrderStatus,
};

