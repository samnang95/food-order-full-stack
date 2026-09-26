export class IOrderRepository {
  async getOrders() {
    throw new Error('Method getOrders() must be implemented.');
  }

  async getOrderById() {
    throw new Error('Method getOrderById() must be implemented.');
  }

  async updateOrderStatus() {
    throw new Error('Method updateOrderStatus() must be implemented.');
  }

  async cancelOrder() {
    throw new Error('Method cancelOrder() must be implemented.');
  }
}
