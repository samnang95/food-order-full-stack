import { ApiClient } from '../services/api_client';
import { socketService } from '../services/socket_service';
import { LocalDB, indexedDBService, DBKeys } from '../db';
import { orderRepository, foodRepository, voucherRepository, reviewRepository, invoiceRepository, driverChatRepository, loyaltyRepository, scheduleRepository, groupOrderRepository, dietaryRepository, driverTipRepository, trackingRepository } from '../../data';
import {
  GetFoodsUseCase,
  GetFoodByIdUseCase,
  GetCategoriesUseCase,
  GetCategoryDetailUseCase,
  GetFoodsByCategoryUseCase,
  GetOrdersUseCase,
  GetOrderByIdUseCase,
  CreateOrderUseCase,
  CancelOrderUseCase,
  GetOrderAnalyticsUseCase,
  GetVouchersUseCase,
  ValidateVoucherUseCase,
  SubmitReviewUseCase,
  GetOrderReviewUseCase,
  GetFoodReviewsUseCase,
  GenerateInvoiceUseCase,
  GetChatMessagesUseCase,
  SendDriverMessageUseCase,
  SaveDeliveryInstructionUseCase,
  GetLoyaltyProfileUseCase,
  ClaimDailyCheckInUseCase,
  RedeemRewardUseCase,
  EarnPointsUseCase,
  GetDeliveryScheduleUseCase,
  SaveDeliveryScheduleUseCase,
  ExecuteQuickReorderUseCase,
  GetActiveGroupOrderUseCase,
  CreateGroupOrderUseCase,
  JoinGroupOrderUseCase,
  AddMemberItemUseCase,
  RemoveMemberItemUseCase,
  LockGroupOrderUseCase,
  LeaveGroupOrderUseCase,
  GetUserDietaryPreferencesUseCase,
  SaveUserDietaryPreferencesUseCase,
  GetDishNutritionUseCase,
  FilterDishesByDietaryUseCase,
  CalculateCartNutritionUseCase,
  GetDriverProfileUseCase,
  SubmitDriverTipUseCase,
  SubmitDriverFeedbackUseCase,
  GetOrderTipStatusUseCase,
  GenerateBakongTipQrUseCase,
  GetTrackingByOrderIdUseCase,
  GetActiveDeliveriesUseCase,
  UpdateDriverLocationUseCase,
  UpdateTrackingStatusUseCase,
} from '../../domain';

// Use Cases Singletons
const getActiveGroupOrderUseCase = new GetActiveGroupOrderUseCase(groupOrderRepository);
const createGroupOrderUseCase = new CreateGroupOrderUseCase(groupOrderRepository);
const joinGroupOrderUseCase = new JoinGroupOrderUseCase(groupOrderRepository);
const addMemberItemUseCase = new AddMemberItemUseCase(groupOrderRepository);
const removeMemberItemUseCase = new RemoveMemberItemUseCase(groupOrderRepository);
const lockGroupOrderUseCase = new LockGroupOrderUseCase(groupOrderRepository);
const leaveGroupOrderUseCase = new LeaveGroupOrderUseCase(groupOrderRepository);

const getUserDietaryPreferencesUseCase = new GetUserDietaryPreferencesUseCase(dietaryRepository);
const saveUserDietaryPreferencesUseCase = new SaveUserDietaryPreferencesUseCase(dietaryRepository);
const getDishNutritionUseCase = new GetDishNutritionUseCase(dietaryRepository);
const filterDishesByDietaryUseCase = new FilterDishesByDietaryUseCase(dietaryRepository);
const calculateCartNutritionUseCase = new CalculateCartNutritionUseCase(dietaryRepository);

const getDriverProfileUseCase = new GetDriverProfileUseCase(driverTipRepository);
const submitDriverTipUseCase = new SubmitDriverTipUseCase(driverTipRepository);
const submitDriverFeedbackUseCase = new SubmitDriverFeedbackUseCase(driverTipRepository);
const getOrderTipStatusUseCase = new GetOrderTipStatusUseCase(driverTipRepository);
const generateBakongTipQrUseCase = new GenerateBakongTipQrUseCase(driverTipRepository);

const getTrackingByOrderIdUseCase = new GetTrackingByOrderIdUseCase(trackingRepository);
const getActiveDeliveriesUseCase = new GetActiveDeliveriesUseCase(trackingRepository);
const updateDriverLocationUseCase = new UpdateDriverLocationUseCase(trackingRepository);
const updateTrackingStatusUseCase = new UpdateTrackingStatusUseCase(trackingRepository);

// Use Cases Singletons
const getFoodsUseCase = new GetFoodsUseCase(foodRepository);
const getFoodByIdUseCase = new GetFoodByIdUseCase(foodRepository);
const getCategoriesUseCase = new GetCategoriesUseCase(foodRepository);
const getCategoryDetailUseCase = new GetCategoryDetailUseCase(foodRepository);
const getFoodsByCategoryUseCase = new GetFoodsByCategoryUseCase(foodRepository);

const getOrdersUseCase = new GetOrdersUseCase(orderRepository);
const getOrderByIdUseCase = new GetOrderByIdUseCase(orderRepository);
const createOrderUseCase = new CreateOrderUseCase(orderRepository);
const cancelOrderUseCase = new CancelOrderUseCase(orderRepository);
const getOrderAnalyticsUseCase = new GetOrderAnalyticsUseCase(orderRepository);

const getVouchersUseCase = new GetVouchersUseCase(voucherRepository);
const validateVoucherUseCase = new ValidateVoucherUseCase(voucherRepository);

const submitReviewUseCase = new SubmitReviewUseCase(reviewRepository);
const getOrderReviewUseCase = new GetOrderReviewUseCase(reviewRepository);
const getFoodReviewsUseCase = new GetFoodReviewsUseCase(reviewRepository);
const generateInvoiceUseCase = new GenerateInvoiceUseCase(invoiceRepository);

const getChatMessagesUseCase = new GetChatMessagesUseCase(driverChatRepository);
const sendDriverMessageUseCase = new SendDriverMessageUseCase(driverChatRepository);
const saveDeliveryInstructionUseCase = new SaveDeliveryInstructionUseCase(driverChatRepository);

const getLoyaltyProfileUseCase = new GetLoyaltyProfileUseCase(loyaltyRepository);
const claimDailyCheckInUseCase = new ClaimDailyCheckInUseCase(loyaltyRepository);
const redeemRewardUseCase = new RedeemRewardUseCase(loyaltyRepository);
const earnPointsUseCase = new EarnPointsUseCase(loyaltyRepository);

const getDeliveryScheduleUseCase = new GetDeliveryScheduleUseCase(scheduleRepository);
const saveDeliveryScheduleUseCase = new SaveDeliveryScheduleUseCase(scheduleRepository);
const executeQuickReorderUseCase = new ExecuteQuickReorderUseCase(scheduleRepository);

export const container = {
  // Repositories
  getOrderRepository: () => orderRepository,
  getFoodRepository: () => foodRepository,
  getVoucherRepository: () => voucherRepository,
  getReviewRepository: () => reviewRepository,
  getInvoiceRepository: () => invoiceRepository,
  getDriverChatRepository: () => driverChatRepository,
  getLoyaltyRepository: () => loyaltyRepository,
  orderRepository,
  foodRepository,
  voucherRepository,
  reviewRepository,
  invoiceRepository,
  driverChatRepository,
  loyaltyRepository,

  // Foods & Categories Use Cases
  getFoodsUseCase,
  getFoodByIdUseCase,
  getCategoriesUseCase,
  getCategoryDetailUseCase,
  getFoodsByCategoryUseCase,
  getGetFoodsUseCase: () => getFoodsUseCase,
  getGetFoodByIdUseCase: () => getFoodByIdUseCase,
  getGetCategoriesUseCase: () => getCategoriesUseCase,
  getGetCategoryDetailUseCase: () => getCategoryDetailUseCase,
  getGetFoodsByCategoryUseCase: () => getFoodsByCategoryUseCase,

  // Orders Use Cases
  getOrdersUseCase,
  getOrderByIdUseCase,
  createOrderUseCase,
  cancelOrderUseCase,
  getOrderAnalyticsUseCase,
  getGetOrdersUseCase: () => getOrdersUseCase,
  getGetOrderByIdUseCase: () => getOrderByIdUseCase,
  getCreateOrderUseCase: () => createOrderUseCase,
  getCancelOrderUseCase: () => cancelOrderUseCase,
  getGetOrderAnalyticsUseCase: () => getOrderAnalyticsUseCase,

  // Vouchers Use Cases
  getVouchersUseCase,
  validateVoucherUseCase,
  getGetVouchersUseCase: () => getVouchersUseCase,
  getValidateVoucherUseCase: () => validateVoucherUseCase,

  // Reviews Use Cases
  submitReviewUseCase,
  getOrderReviewUseCase,
  getFoodReviewsUseCase,
  getSubmitReviewUseCase: () => submitReviewUseCase,
  getGetOrderReviewUseCase: () => getOrderReviewUseCase,
  getGetFoodReviewsUseCase: () => getFoodReviewsUseCase,

  // Invoices Use Cases
  generateInvoiceUseCase,
  getGenerateInvoiceUseCase: () => generateInvoiceUseCase,

  // Driver Chat Use Cases
  getChatMessagesUseCase,
  sendDriverMessageUseCase,
  saveDeliveryInstructionUseCase,
  getGetChatMessagesUseCase: () => getChatMessagesUseCase,
  getSendDriverMessageUseCase: () => sendDriverMessageUseCase,
  getSaveDeliveryInstructionUseCase: () => saveDeliveryInstructionUseCase,

  // Loyalty & Rewards Use Cases
  getLoyaltyProfileUseCase,
  claimDailyCheckInUseCase,
  redeemRewardUseCase,
  earnPointsUseCase,
  getGetLoyaltyProfileUseCase: () => getLoyaltyProfileUseCase,
  getClaimDailyCheckInUseCase: () => claimDailyCheckInUseCase,
  getRedeemRewardUseCase: () => redeemRewardUseCase,
  getEarnPointsUseCase: () => earnPointsUseCase,

  // Schedule & Quick Reorder Use Cases
  getDeliveryScheduleUseCase,
  saveDeliveryScheduleUseCase,
  executeQuickReorderUseCase,
  getScheduleRepository: () => scheduleRepository,
  scheduleRepository,
  getGetDeliveryScheduleUseCase: () => getDeliveryScheduleUseCase,
  getSaveDeliveryScheduleUseCase: () => saveDeliveryScheduleUseCase,
  getExecuteQuickReorderUseCase: () => executeQuickReorderUseCase,

  // Group Order & Split Bill Use Cases
  getActiveGroupOrderUseCase,
  createGroupOrderUseCase,
  joinGroupOrderUseCase,
  addMemberItemUseCase,
  removeMemberItemUseCase,
  lockGroupOrderUseCase,
  leaveGroupOrderUseCase,
  getGroupOrderRepository: () => groupOrderRepository,
  groupOrderRepository,
  getGetActiveGroupOrderUseCase: () => getActiveGroupOrderUseCase,
  getCreateGroupOrderUseCase: () => createGroupOrderUseCase,
  getJoinGroupOrderUseCase: () => joinGroupOrderUseCase,
  getAddMemberItemUseCase: () => addMemberItemUseCase,
  getRemoveMemberItemUseCase: () => removeMemberItemUseCase,
  getLockGroupOrderUseCase: () => lockGroupOrderUseCase,
  getLeaveGroupOrderUseCase: () => leaveGroupOrderUseCase,

  // Dietary & Nutrition Use Cases
  dietaryRepository,
  getUserDietaryPreferencesUseCase,
  saveUserDietaryPreferencesUseCase,
  getDishNutritionUseCase,
  filterDishesByDietaryUseCase,
  calculateCartNutritionUseCase,
  getDietaryRepository: () => dietaryRepository,
  getGetUserDietaryPreferencesUseCase: () => getUserDietaryPreferencesUseCase,
  getSaveUserDietaryPreferencesUseCase: () => saveUserDietaryPreferencesUseCase,
  getGetDishNutritionUseCase: () => getDishNutritionUseCase,
  getFilterDishesByDietaryUseCase: () => filterDishesByDietaryUseCase,
  getCalculateCartNutritionUseCase: () => calculateCartNutritionUseCase,

  // Driver Tip & Feedback Use Cases
  driverTipRepository,
  getDriverProfileUseCase,
  submitDriverTipUseCase,
  submitDriverFeedbackUseCase,
  getOrderTipStatusUseCase,
  generateBakongTipQrUseCase,
  getDriverTipRepository: () => driverTipRepository,
  getGetDriverProfileUseCase: () => getDriverProfileUseCase,
  getSubmitDriverTipUseCase: () => submitDriverTipUseCase,
  getSubmitDriverFeedbackUseCase: () => submitDriverFeedbackUseCase,
  getGetOrderTipStatusUseCase: () => getOrderTipStatusUseCase,
  getGenerateBakongTipQrUseCase: () => generateBakongTipQrUseCase,

  // Delivery Tracking Use Cases
  trackingRepository,
  getTrackingByOrderIdUseCase,
  getActiveDeliveriesUseCase,
  updateDriverLocationUseCase,
  updateTrackingStatusUseCase,
  getTrackingRepository: () => trackingRepository,
  getGetTrackingByOrderIdUseCase: () => getTrackingByOrderIdUseCase,
  getGetActiveDeliveriesUseCase: () => getActiveDeliveriesUseCase,
  getUpdateDriverLocationUseCase: () => updateDriverLocationUseCase,
  getUpdateTrackingStatusUseCase: () => updateTrackingStatusUseCase,

  // Services & Storage
  getApiClient: () => ApiClient,
  getSocketService: () => socketService,
  getLocalDB: () => LocalDB,
  getIndexedDBService: () => indexedDBService,
  apiClient: ApiClient,
  socketService,
  localDB: LocalDB,
  indexedDB: indexedDBService,
  dbKeys: DBKeys,
};

export const DI = container;

export {
  ApiClient,
  socketService,
  LocalDB,
  indexedDBService,
  DBKeys,
  orderRepository,
  foodRepository,
  voucherRepository,
  reviewRepository,
  invoiceRepository,
  driverChatRepository,
  loyaltyRepository,
  scheduleRepository,
  groupOrderRepository,
  dietaryRepository,
  driverTipRepository,
  getFoodsUseCase,
  getFoodByIdUseCase,
  getCategoriesUseCase,
  getCategoryDetailUseCase,
  getFoodsByCategoryUseCase,
  getOrdersUseCase,
  getOrderByIdUseCase,
  createOrderUseCase,
  cancelOrderUseCase,
  getVouchersUseCase,
  validateVoucherUseCase,
  submitReviewUseCase,
  getOrderReviewUseCase,
  getFoodReviewsUseCase,
  generateInvoiceUseCase,
  getChatMessagesUseCase,
  sendDriverMessageUseCase,
  saveDeliveryInstructionUseCase,
  getLoyaltyProfileUseCase,
  claimDailyCheckInUseCase,
  redeemRewardUseCase,
  earnPointsUseCase,
  getDeliveryScheduleUseCase,
  saveDeliveryScheduleUseCase,
  executeQuickReorderUseCase,
  getActiveGroupOrderUseCase,
  createGroupOrderUseCase,
  joinGroupOrderUseCase,
  addMemberItemUseCase,
  removeMemberItemUseCase,
  lockGroupOrderUseCase,
  leaveGroupOrderUseCase,
  getUserDietaryPreferencesUseCase,
  saveUserDietaryPreferencesUseCase,
  getDishNutritionUseCase,
  filterDishesByDietaryUseCase,
  calculateCartNutritionUseCase,
  getDriverProfileUseCase,
  submitDriverTipUseCase,
  submitDriverFeedbackUseCase,
  getOrderTipStatusUseCase,
  generateBakongTipQrUseCase,
  getOrderAnalyticsUseCase,
  trackingRepository,
  getTrackingByOrderIdUseCase,
  getActiveDeliveriesUseCase,
  updateDriverLocationUseCase,
  updateTrackingStatusUseCase,
};



