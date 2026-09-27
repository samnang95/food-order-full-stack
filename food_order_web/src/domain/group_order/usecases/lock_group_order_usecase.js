export class LockGroupOrderUseCase {
  constructor(groupOrderRepository) {
    this.groupOrderRepository = groupOrderRepository;
  }

  async execute({ groupId, isLocked }) {
    if (!groupId) {
      throw new Error('Group ID is required to lock/unlock.');
    }
    return this.groupOrderRepository.lockGroupOrder({ groupId, isLocked });
  }
}
