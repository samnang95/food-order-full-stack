const groupOrderService = require('../services/groupOrderService');

const createGroupOrder = async (req, res) => {
  try {
    const { title, spendingLimitPerPerson, deliveryAddress } = req.body;
    const hostId = req.user?.id || req.body.hostId || `host_${Date.now()}`;
    const hostName = req.user?.username || req.body.hostName || 'Host';
    const hostAvatar = req.user?.avatar || req.body.hostAvatar || '';

    const groupOrder = await groupOrderService.createGroupOrder({
      hostId,
      hostName,
      hostAvatar,
      title,
      spendingLimitPerPerson,
      deliveryAddress,
    });

    res.status(201).json({ success: true, groupOrder });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const getGroupOrder = async (req, res) => {
  try {
    const groupOrder = await groupOrderService.getGroupOrder(req.params.groupId);
    res.json({ success: true, groupOrder });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
};

const joinGroupOrder = async (req, res) => {
  try {
    const { memberId, name, avatar } = req.body;
    const userId = req.user?.id || memberId;
    const userName = req.user?.username || name;
    const userAvatar = req.user?.avatar || avatar;

    const groupOrder = await groupOrderService.joinGroupOrder(req.params.groupId, {
      memberId: userId,
      name: userName,
      avatar: userAvatar,
    });

    res.json({ success: true, groupOrder });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const leaveGroupOrder = async (req, res) => {
  try {
    const memberId = req.user?.id || req.body.memberId;
    const groupOrder = await groupOrderService.leaveGroupOrder(req.params.groupId, memberId);
    res.json({ success: true, groupOrder });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const addItem = async (req, res) => {
  try {
    const itemData = req.body;
    if (req.user && !itemData.addedBy) {
      itemData.addedBy = {
        id: req.user.id,
        name: req.user.username,
        avatar: req.user.avatar || '',
      };
    }
    const groupOrder = await groupOrderService.addItemToGroup(req.params.groupId, itemData);
    res.status(201).json({ success: true, groupOrder });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const removeItem = async (req, res) => {
  try {
    const groupOrder = await groupOrderService.removeItemFromGroup(req.params.groupId, req.params.itemId);
    res.json({ success: true, groupOrder });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const lockGroupOrder = async (req, res) => {
  try {
    const { isLocked } = req.body;
    const groupOrder = await groupOrderService.setLockStatus(req.params.groupId, Boolean(isLocked));
    res.json({ success: true, groupOrder });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  createGroupOrder,
  getGroupOrder,
  joinGroupOrder,
  leaveGroupOrder,
  addItem,
  removeItem,
  lockGroupOrder,
};
