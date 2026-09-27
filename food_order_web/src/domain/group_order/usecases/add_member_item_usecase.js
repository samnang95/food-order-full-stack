export class AddMemberItemUseCase {
  constructor(groupOrderRepository) {
    this.groupOrderRepository = groupOrderRepository;
  }

  async execute({ groupId, item }) {
    if (!groupId || !item) {
      throw new Error('Group ID and item details are required.');
    }
    return this.groupOrderRepository.addMemberItem({ groupId, item });
  }
}
