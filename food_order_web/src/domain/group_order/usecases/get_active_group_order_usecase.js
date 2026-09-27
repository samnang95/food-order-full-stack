export class GetActiveGroupOrderUseCase {
  constructor(groupOrderRepository) {
    this.groupOrderRepository = groupOrderRepository;
  }

  async execute() {
    return this.groupOrderRepository.getActiveGroupOrder();
  }
}
