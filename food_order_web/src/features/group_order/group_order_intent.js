export const GroupOrderIntentType = {
  OPEN_GROUP_MODAL: 'GROUP_ORDER/OPEN_GROUP_MODAL',
  CLOSE_GROUP_MODAL: 'GROUP_ORDER/CLOSE_GROUP_MODAL',
  TOGGLE_GROUP_MODAL: 'GROUP_ORDER/TOGGLE_GROUP_MODAL',

  OPEN_SPLIT_BILL_MODAL: 'GROUP_ORDER/OPEN_SPLIT_BILL_MODAL',
  CLOSE_SPLIT_BILL_MODAL: 'GROUP_ORDER/CLOSE_SPLIT_BILL_MODAL',

  SET_LOADING: 'GROUP_ORDER/SET_LOADING',
  SET_ERROR: 'GROUP_ORDER/SET_ERROR',

  SET_GROUP_ORDER_SUCCESS: 'GROUP_ORDER/SET_GROUP_ORDER_SUCCESS',
  SET_CURRENT_MEMBER: 'GROUP_ORDER/SET_CURRENT_MEMBER',
  LEAVE_GROUP_ORDER_SUCCESS: 'GROUP_ORDER/LEAVE_GROUP_ORDER_SUCCESS',

  SET_COPIED_LINK: 'GROUP_ORDER/SET_COPIED_LINK',
  SET_COPIED_SPLIT_SUMMARY: 'GROUP_ORDER/SET_COPIED_SPLIT_SUMMARY',
};

export const GroupOrderIntent = {
  openGroupModal: () => ({ type: GroupOrderIntentType.OPEN_GROUP_MODAL }),
  closeGroupModal: () => ({ type: GroupOrderIntentType.CLOSE_GROUP_MODAL }),
  toggleGroupModal: () => ({ type: GroupOrderIntentType.TOGGLE_GROUP_MODAL }),

  openSplitBillModal: () => ({ type: GroupOrderIntentType.OPEN_SPLIT_BILL_MODAL }),
  closeSplitBillModal: () => ({ type: GroupOrderIntentType.CLOSE_SPLIT_BILL_MODAL }),

  setLoading: (isLoading) => ({
    type: GroupOrderIntentType.SET_LOADING,
    payload: isLoading,
  }),

  setError: (error) => ({
    type: GroupOrderIntentType.SET_ERROR,
    payload: error,
  }),

  setGroupOrderSuccess: (groupOrder) => ({
    type: GroupOrderIntentType.SET_GROUP_ORDER_SUCCESS,
    payload: groupOrder,
  }),

  setCurrentMember: (member) => ({
    type: GroupOrderIntentType.SET_CURRENT_MEMBER,
    payload: member,
  }),

  leaveGroupOrderSuccess: () => ({
    type: GroupOrderIntentType.LEAVE_GROUP_ORDER_SUCCESS,
  }),

  setCopiedLink: (copied) => ({
    type: GroupOrderIntentType.SET_COPIED_LINK,
    payload: copied,
  }),

  setCopiedSplitSummary: (copied) => ({
    type: GroupOrderIntentType.SET_COPIED_SPLIT_SUMMARY,
    payload: copied,
  }),
};
