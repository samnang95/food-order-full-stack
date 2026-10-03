import { LocalDB } from '../../../core/db/local_db';
import { DBKeys } from '../../../core/db/db_keys';
import type { StaffMember } from '../../../domain/staff/entities/staff_member';

const SEED_STAFF: StaffMember[] = [
  {
    id: 'staff_01',
    username: 'admin',
    email: 'admin@foodhub.com',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
    title: 'Executive Director (Super Admin)',
    department: 'Executive Management',
    status: 'active',
    phoneNumber: '+1 (555) 019-2831',
    shift: 'full_day',
    ordersHandled: 420,
    createdAt: '2025-01-10T08:00:00Z',
    lastActiveAt: new Date().toISOString(),
  },
  {
    id: 'staff_02',
    username: 'elena.vance',
    email: 'manager@foodhub.com',
    role: 'manager',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80',
    title: 'Store Operations Manager',
    department: 'Restaurant Operations',
    status: 'active',
    phoneNumber: '+1 (555) 019-2832',
    shift: 'morning',
    ordersHandled: 312,
    createdAt: '2025-02-15T09:30:00Z',
    lastActiveAt: new Date().toISOString(),
  },
  {
    id: 'staff_03',
    username: 'chef.mario',
    email: 'kitchen@foodhub.com',
    role: 'kitchen',
    avatar: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=120&q=80',
    title: 'Executive Head Chef',
    department: 'Kitchen Operations',
    status: 'active',
    phoneNumber: '+1 (555) 019-2833',
    shift: 'evening',
    ordersHandled: 580,
    createdAt: '2025-01-20T10:00:00Z',
    lastActiveAt: new Date().toISOString(),
  },
  {
    id: 'staff_04',
    username: 'kenji.sato',
    email: 'kenji@foodhub.com',
    role: 'kitchen',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
    title: 'Sous Chef / Grill Master',
    department: 'Kitchen Operations',
    status: 'on_break',
    phoneNumber: '+1 (555) 019-2834',
    shift: 'evening',
    ordersHandled: 275,
    createdAt: '2025-03-01T11:00:00Z',
    lastActiveAt: new Date().toISOString(),
  },
  {
    id: 'staff_05',
    username: 'cashier.sarah',
    email: 'staff@foodhub.com',
    role: 'staff',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=120&q=80',
    title: 'Front Cashier & Orders Lead',
    department: 'Front-of-House',
    status: 'active',
    phoneNumber: '+1 (555) 019-2835',
    shift: 'morning',
    ordersHandled: 640,
    createdAt: '2025-02-01T08:30:00Z',
    lastActiveAt: new Date().toISOString(),
  },
  {
    id: 'staff_06',
    username: 'david.kim',
    email: 'david@foodhub.com',
    role: 'staff',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80',
    title: 'Drive-Thru & Counter Staff',
    department: 'Front-of-House',
    status: 'inactive',
    phoneNumber: '+1 (555) 019-2836',
    shift: 'night',
    ordersHandled: 198,
    createdAt: '2025-04-10T14:00:00Z',
    lastActiveAt: new Date().toISOString(),
  },
];

export class StaffLocalDataSource {
  getStaffList(): StaffMember[] {
    const list = LocalDB.getJson<StaffMember[]>(DBKeys.CACHED_STAFF);
    if (!list || list.length === 0) {
      LocalDB.setJson(DBKeys.CACHED_STAFF, SEED_STAFF);
      return SEED_STAFF;
    }
    return list;
  }

  saveStaffList(list: StaffMember[]): void {
    LocalDB.setJson(DBKeys.CACHED_STAFF, list);
  }

  addStaff(member: StaffMember): void {
    const list = this.getStaffList();
    list.unshift(member);
    this.saveStaffList(list);
  }

  updateStaff(updated: StaffMember): void {
    const list = this.getStaffList();
    const index = list.findIndex((s) => s.id === updated.id);
    if (index !== -1) {
      list[index] = updated;
      this.saveStaffList(list);
    }
  }

  deleteStaff(id: string): void {
    const list = this.getStaffList().filter((s) => s.id !== id);
    this.saveStaffList(list);
  }
}
