import { useReducer, useEffect, useCallback, useRef } from 'react';
import { initialGroupOrderState } from './group_order_state';
import { GroupOrderIntentType, GroupOrderIntent } from './group_order_intent';
import { container } from '../../core/di/container';
import { socketService } from '../../core/services/socket_service';
import { GroupOrderModel } from '../../data/group_order/models/group_order_model';

export function groupOrderReducer(state, action) {
  switch (action.type) {
    case GroupOrderIntentType.OPEN_GROUP_MODAL:
      return { ...state, isGroupModalOpen: true, error: null };

    case GroupOrderIntentType.CLOSE_GROUP_MODAL:
      return { ...state, isGroupModalOpen: false };

    case GroupOrderIntentType.TOGGLE_GROUP_MODAL:
      return { ...state, isGroupModalOpen: !state.isGroupModalOpen };

    case GroupOrderIntentType.OPEN_SPLIT_BILL_MODAL:
      return { ...state, isSplitBillModalOpen: true };

    case GroupOrderIntentType.CLOSE_SPLIT_BILL_MODAL:
      return { ...state, isSplitBillModalOpen: false };

    case GroupOrderIntentType.SET_LOADING:
      return { ...state, isLoading: action.payload };

    case GroupOrderIntentType.SET_ERROR:
      return { ...state, error: action.payload, isLoading: false };

    case GroupOrderIntentType.SET_GROUP_ORDER_SUCCESS:
      return {
        ...state,
        groupOrder: action.payload,
        isLoading: false,
        error: null,
      };

    case GroupOrderIntentType.SET_CURRENT_MEMBER:
      return {
        ...state,
        currentMember: action.payload,
      };

    case GroupOrderIntentType.LEAVE_GROUP_ORDER_SUCCESS:
      return {
        ...state,
        groupOrder: null,
        currentMember: null,
        isGroupModalOpen: false,
        isSplitBillModalOpen: false,
        isLoading: false,
        error: null,
      };

    case GroupOrderIntentType.SET_COPIED_LINK:
      return { ...state, copiedLink: action.payload };

    case GroupOrderIntentType.SET_COPIED_SPLIT_SUMMARY:
      return { ...state, copiedSplitSummary: action.payload };

    default:
      return state;
  }
}

export function useGroupOrderStore() {
  const [state, dispatch] = useReducer(groupOrderReducer, initialGroupOrderState);
  const groupOrderRef = useRef(state.groupOrder);

  useEffect(() => {
    groupOrderRef.current = state.groupOrder;
  }, [state.groupOrder]);

  // Load existing session on mount or detect invite link in URL query params
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const active = await container.getActiveGroupOrderUseCase.execute();
        if (isMounted && active) {
          dispatch(GroupOrderIntent.setGroupOrderSuccess(active));
          const savedMember = container.groupOrderRepository.getCurrentMember();
          if (savedMember) {
            dispatch(GroupOrderIntent.setCurrentMember(savedMember));
          }
        } else if (typeof window !== 'undefined' && isMounted) {
          const params = new URLSearchParams(window.location.search);
          const inviteCode = params.get('group') || params.get('join');
          if (inviteCode) {
            dispatch(GroupOrderIntent.openGroupModal());
          }
        }
      } catch (e) {
        console.warn('Failed to restore active group order:', e);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  // Subscribe to real-time collaborative updates via socket
  useEffect(() => {
    if (!state.groupOrder?.id) return;
    const groupId = state.groupOrder.id;

    // Join room
    socketService.emit('group:join', {
      groupId,
      member: state.currentMember,
    });

    const handleUpdated = (rawGroup) => {
      try {
        const entity = GroupOrderModel.fromJson(rawGroup);
        if (entity) {
          dispatch(GroupOrderIntent.setGroupOrderSuccess(entity));
        }
      } catch (err) {
        console.warn('Failed to parse socket group:updated event:', err);
      }
    };

    const handleLocked = ({ isLocked }) => {
      const current = groupOrderRef.current;
      if (current) {
        const updated = GroupOrderModel.fromJson({
          ...GroupOrderModel.toJson(current),
          isLocked,
          status: isLocked ? 'locked' : 'active',
        });
        dispatch(GroupOrderIntent.setGroupOrderSuccess(updated));
      }
    };

    const handleItemEvent = (payload) => {
      const rawGroup = payload?.groupOrder || payload;
      if (rawGroup) {
        const entity = GroupOrderModel.fromJson(rawGroup);
        if (entity) {
          dispatch(GroupOrderIntent.setGroupOrderSuccess(entity));
        }
      }
    };

    const handleOrdered = (payload) => {
      const rawGroup = payload?.groupOrder || payload;
      if (rawGroup) {
        const entity = GroupOrderModel.fromJson(rawGroup);
        if (entity) {
          dispatch(GroupOrderIntent.setGroupOrderSuccess(entity));
        }
      }
    };

    socketService.on('group:updated', handleUpdated);
    socketService.on('group:locked', handleLocked);
    socketService.on('group:item_added', handleItemEvent);
    socketService.on('group:item_removed', handleItemEvent);
    socketService.on('group:member_joined', handleItemEvent);
    socketService.on('group:member_left', handleItemEvent);
    socketService.on('group:ordered', handleOrdered);

    return () => {
      socketService.off('group:updated', handleUpdated);
      socketService.off('group:locked', handleLocked);
      socketService.off('group:item_added', handleItemEvent);
      socketService.off('group:item_removed', handleItemEvent);
      socketService.off('group:member_joined', handleItemEvent);
      socketService.off('group:member_left', handleItemEvent);
      socketService.off('group:ordered', handleOrdered);
    };
  }, [state.groupOrder?.id, state.currentMember]);


  const openGroupModal = useCallback(() => {
    dispatch(GroupOrderIntent.openGroupModal());
  }, []);

  const closeGroupModal = useCallback(() => {
    dispatch(GroupOrderIntent.closeGroupModal());
  }, []);

  const openSplitBillModal = useCallback(() => {
    dispatch(GroupOrderIntent.openSplitBillModal());
  }, []);

  const closeSplitBillModal = useCallback(() => {
    dispatch(GroupOrderIntent.closeSplitBillModal());
  }, []);

  const createGroupOrder = useCallback(
    async ({ title, hostName, avatar }) => {
      dispatch(GroupOrderIntent.setLoading(true));
      try {
        const newGroup = await container.createGroupOrderUseCase.execute({
          title,
          hostMember: { name: hostName, avatar },
        });
        dispatch(GroupOrderIntent.setGroupOrderSuccess(newGroup));
        const host = newGroup.members.find((m) => m.isHost) || newGroup.members[0];
        dispatch(GroupOrderIntent.setCurrentMember(host));
        return { success: true, groupOrder: newGroup };
      } catch (err) {
        dispatch(GroupOrderIntent.setError(err.message || 'Failed to create group order'));
        return { success: false, error: err.message };
      }
    },
    []
  );

  const joinGroupOrder = useCallback(
    async ({ code, memberName, avatar }) => {
      dispatch(GroupOrderIntent.setLoading(true));
      try {
        const joinedGroup = await container.joinGroupOrderUseCase.execute({
          code,
          member: { name: memberName, avatar },
        });
        dispatch(GroupOrderIntent.setGroupOrderSuccess(joinedGroup));
        const member =
          joinedGroup.members.find((m) => m.name.toLowerCase() === memberName.toLowerCase()) ||
          joinedGroup.members[joinedGroup.members.length - 1];
        dispatch(GroupOrderIntent.setCurrentMember(member));
        return { success: true, groupOrder: joinedGroup };
      } catch (err) {
        dispatch(GroupOrderIntent.setError(err.message || 'Failed to join group order'));
        return { success: false, error: err.message };
      }
    },
    []
  );

  const addItemToGroup = useCallback(
    async ({ food, quantity = 1, notes = '' }) => {
      if (!state.groupOrder) return { success: false, error: 'No active group order' };
      if (!state.currentMember) return { success: false, error: 'No member identity set' };

      try {
        const updated = await container.addMemberItemUseCase.execute({
          groupId: state.groupOrder.id,
          item: {
            foodId: food.id,
            foodName: food.title || food.name,
            foodImageUrl: food.imageUrl || '',
            price: food.price || 0,
            quantity,
            notes,
            memberId: state.currentMember.id,
            memberName: state.currentMember.name,
            memberColor: state.currentMember.color,
          },
        });
        dispatch(GroupOrderIntent.setGroupOrderSuccess(updated));
        return { success: true, groupOrder: updated };
      } catch (err) {
        return { success: false, error: err.message };
      }
    },
    [state.groupOrder, state.currentMember]
  );

  const removeItemFromGroup = useCallback(
    async (itemId) => {
      if (!state.groupOrder) return;
      try {
        const updated = await container.removeMemberItemUseCase.execute({
          groupId: state.groupOrder.id,
          itemId,
          memberId: state.currentMember?.id,
        });
        if (updated) {
          dispatch(GroupOrderIntent.setGroupOrderSuccess(updated));
        }
      } catch (err) {
        console.warn('Failed to remove group item:', err);
      }
    },
    [state.groupOrder, state.currentMember]
  );

  const toggleLockGroup = useCallback(
    async (lock) => {
      if (!state.groupOrder) return;
      try {
        const updated = await container.lockGroupOrderUseCase.execute({
          groupId: state.groupOrder.id,
          isLocked: lock,
        });
        if (updated) {
          dispatch(GroupOrderIntent.setGroupOrderSuccess(updated));
        }
      } catch (err) {
        console.warn('Failed to lock group order:', err);
      }
    },
    [state.groupOrder]
  );

  const leaveGroupOrder = useCallback(async () => {
    if (state.groupOrder) {
      await container.leaveGroupOrderUseCase.execute({
        groupId: state.groupOrder.id,
        memberId: state.currentMember?.id,
      });
    }
    dispatch(GroupOrderIntent.leaveGroupOrderSuccess());
  }, [state.groupOrder, state.currentMember]);

  const copyInviteLink = useCallback(() => {
    if (!state.groupOrder?.code) return;
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const shareUrl = `${origin}/?group=${state.groupOrder.code}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      dispatch(GroupOrderIntent.setCopiedLink(true));
      setTimeout(() => dispatch(GroupOrderIntent.setCopiedLink(false)), 3000);
    });
  }, [state.groupOrder]);

  const isHost = Boolean(
    state.currentMember && state.groupOrder && state.currentMember.id === state.groupOrder.hostId
  );

  return {
    state,
    groupOrder: state.groupOrder,
    currentMember: state.currentMember,
    isGroupOrderActive: Boolean(state.groupOrder),
    isHost,
    isLocked: Boolean(state.groupOrder?.isLocked),
    isGroupModalOpen: state.isGroupModalOpen,
    isSplitBillModalOpen: state.isSplitBillModalOpen,
    isLoading: state.isLoading,
    error: state.error,
    copiedLink: state.copiedLink,
    copiedSplitSummary: state.copiedSplitSummary,

    // Actions
    openGroupModal,
    closeGroupModal,
    openSplitBillModal,
    closeSplitBillModal,
    createGroupOrder,
    joinGroupOrder,
    addItemToGroup,
    removeItemFromGroup,
    toggleLockGroup,
    leaveGroupOrder,
    copyInviteLink,
  };
}
