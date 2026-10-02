export class CustomerEntity {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalOrders: number;
  totalSpent: number;
  status: 'active' | 'inactive';
  joinedDate: string;
  avatar: string;

  constructor(data: Partial<CustomerEntity>) {
    this.id = data.id || '';
    this.name = data.name || 'Guest User';
    this.email = data.email || '';
    this.phone = data.phone || '';
    this.totalOrders = Number(data.totalOrders) || 0;
    this.totalSpent = Number(data.totalSpent) || 0;
    this.status = data.status || 'active';
    this.joinedDate = data.joinedDate || 'Recently';
    this.avatar = data.avatar || '';
  }
}
