export class JoinGroupOrderUseCase {
  constructor(groupOrderRepository) {
    this.groupOrderRepository = groupOrderRepository;
  }

  async execute({ code, member }) {
    if (!code || !code.trim()) {
      throw new Error('Group room code is required to join.');
    }
    if (!member || !member.name) {
      throw new Error('Member name is required.');
    }
    return this.groupOrderRepository.joinGroupOrder({ code, member });
  }
}
