import { ApiClient } from '../services/api_client';
import { socketService } from '../services/socket_service';
import { orderRepository, foodRepository } from '../../data';

export const container = {
  getOrderRepository: () => orderRepository,
  getFoodRepository: () => foodRepository,
  getApiClient: () => ApiClient,
  getSocketService: () => socketService,
  orderRepository,
  foodRepository,
  apiClient: ApiClient,
  socketService,
};

export const DI = container;

export { ApiClient, socketService, orderRepository, foodRepository };

