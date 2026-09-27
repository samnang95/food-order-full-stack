import { ApiClient } from '../services/api_client';
import { socketService } from '../services/socket_service';
import { LocalDB, indexedDBService, DBKeys } from '../db';
import { orderRepository, foodRepository, voucherRepository, reviewRepository } from '../../data';
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
  GetVouchersUseCase,
  ValidateVoucherUseCase,
  SubmitReviewUseCase,
  GetOrderReviewUseCase,
  GetFoodReviewsUseCase,
} from '../../domain';

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

const getVouchersUseCase = new GetVouchersUseCase(voucherRepository);
const validateVoucherUseCase = new ValidateVoucherUseCase(voucherRepository);

const submitReviewUseCase = new SubmitReviewUseCase(reviewRepository);
const getOrderReviewUseCase = new GetOrderReviewUseCase(reviewRepository);
const getFoodReviewsUseCase = new GetFoodReviewsUseCase(reviewRepository);

export const container = {
  // Repositories
  getOrderRepository: () => orderRepository,
  getFoodRepository: () => foodRepository,
  getVoucherRepository: () => voucherRepository,
  getReviewRepository: () => reviewRepository,
    orderRepository,
  foodRepository,
  voucherRepository,
  reviewRepository,

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
  getGetOrdersUseCase: () => getOrdersUseCase,
  getGetOrderByIdUseCase: () => getOrderByIdUseCase,
  getCreateOrderUseCase: () => createOrderUseCase,
  getCancelOrderUseCase: () => cancelOrderUseCase,

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
};


