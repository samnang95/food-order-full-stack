/**
 * MVI Intent Types and Action Creators for Delivery Scheduling & Quick Reorder.
 */
export const ScheduleIntentType = {
  SET_MODE: 'SCHEDULE/SET_MODE',
  SET_DATE: 'SCHEDULE/SET_DATE',
  SET_TIME_SLOT: 'SCHEDULE/SET_TIME_SLOT',
  SET_NOTE: 'SCHEDULE/SET_NOTE',

  OPEN_MODAL: 'SCHEDULE/OPEN_MODAL',
  CLOSE_MODAL: 'SCHEDULE/CLOSE_MODAL',
  TOGGLE_MODAL: 'SCHEDULE/TOGGLE_MODAL',

  LOAD_SCHEDULE_SUCCESS: 'SCHEDULE/LOAD_SCHEDULE_SUCCESS',
  SAVE_SCHEDULE_START: 'SCHEDULE/SAVE_SCHEDULE_START',
  SAVE_SCHEDULE_SUCCESS: 'SCHEDULE/SAVE_SCHEDULE_SUCCESS',
  SAVE_SCHEDULE_FAILURE: 'SCHEDULE/SAVE_SCHEDULE_FAILURE',

  REORDER_START: 'SCHEDULE/REORDER_START',
  REORDER_SUCCESS: 'SCHEDULE/REORDER_SUCCESS',
  REORDER_FAILURE: 'SCHEDULE/REORDER_FAILURE',
  CLEAR_REORDER_STATUS: 'SCHEDULE/CLEAR_REORDER_STATUS',
};

export const ScheduleIntent = {
  setMode: (mode) => ({
    type: ScheduleIntentType.SET_MODE,
    payload: mode,
  }),

  setDate: (date) => ({
    type: ScheduleIntentType.SET_DATE,
    payload: date,
  }),

  setTimeSlot: (timeSlot) => ({
    type: ScheduleIntentType.SET_TIME_SLOT,
    payload: timeSlot,
  }),

  setNote: (note) => ({
    type: ScheduleIntentType.SET_NOTE,
    payload: note,
  }),

  openModal: () => ({
    type: ScheduleIntentType.OPEN_MODAL,
  }),

  closeModal: () => ({
    type: ScheduleIntentType.CLOSE_MODAL,
  }),

  toggleModal: () => ({
    type: ScheduleIntentType.TOGGLE_MODAL,
  }),

  loadScheduleSuccess: (schedule) => ({
    type: ScheduleIntentType.LOAD_SCHEDULE_SUCCESS,
    payload: schedule,
  }),

  saveScheduleStart: () => ({
    type: ScheduleIntentType.SAVE_SCHEDULE_START,
  }),

  saveScheduleSuccess: (schedule) => ({
    type: ScheduleIntentType.SAVE_SCHEDULE_SUCCESS,
    payload: schedule,
  }),

  saveScheduleFailure: (error) => ({
    type: ScheduleIntentType.SAVE_SCHEDULE_FAILURE,
    payload: error,
  }),

  reorderStart: (orderId) => ({
    type: ScheduleIntentType.REORDER_START,
    payload: orderId,
  }),

  reorderSuccess: (result) => ({
    type: ScheduleIntentType.REORDER_SUCCESS,
    payload: result,
  }),

  reorderFailure: (error) => ({
    type: ScheduleIntentType.REORDER_FAILURE,
    payload: error,
  }),

  clearReorderStatus: () => ({
    type: ScheduleIntentType.CLEAR_REORDER_STATUS,
  }),
};
