export class RemoveMemberItemUseCase {
  constructor(groupOrderRepository) {
    this.groupOrderRepository = groupOrderRepository;
  }

  async execute({ groupId, itemId, memberId }) {
    if (!groupId || !itemId) {
      throw new Error('Group ID and Item ID are required.');
    }
    return this.groupOrderRepository.removeMemberItem({ groupId, itemId, memberId });
  }
}
