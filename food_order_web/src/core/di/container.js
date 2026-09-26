import { ApiClient } from '../services/api_client';
import { socketService } from '../services/socket_service';
import { orderRepository, foodRepository } from '../../data';

/**
 * Core Dependency Injection Container / Service Locator
 */
export const DI = {
  apiClient: ApiClient,
  socketService: socketService,
  orderRepository: orderRepository,
  foodRepository: foodRepository,
};

export { ApiClient, socketService, orderRepository, foodRepository };
