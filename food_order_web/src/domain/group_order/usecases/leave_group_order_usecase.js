export class LeaveGroupOrderUseCase {
  constructor(groupOrderRepository) {
    this.groupOrderRepository = groupOrderRepository;
  }

  async execute({ groupId, memberId }) {
    return this.groupOrderRepository.leaveGroupOrder({ groupId, memberId });
  }
}
