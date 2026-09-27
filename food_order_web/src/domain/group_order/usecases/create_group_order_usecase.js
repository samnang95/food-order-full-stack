export class CreateGroupOrderUseCase {
  constructor(groupOrderRepository) {
    this.groupOrderRepository = groupOrderRepository;
  }

  async execute({ title, hostMember }) {
    if (!hostMember || !hostMember.name) {
      throw new Error('Host member details are required to create a group order.');
    }
    return this.groupOrderRepository.createGroupOrder({ title, hostMember });
  }
}
