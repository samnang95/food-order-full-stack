import type { UserRole } from '../../domain/auth/entities/user';
import { AppRoutes } from '../../routes/app_routes';

export interface RoleConfig {
  role: UserRole;
  title: string;
  badge: string;
  description: string;
  defaultRoute: string;
  allowedRoutes: string[];
  themeColor: {
    bg: string;
    text: string;
    border: string;
    ring: string;
    dot: string;
  };
}

export const ROLE_CONFIGS: Record<UserRole, RoleConfig> = {
  admin: {
    role: 'admin',
    title: 'Executive Director',
    badge: 'Super Admin',
    description: 'Master root control over all financials, menus, staff, and system settings.',
    defaultRoute: AppRoutes.ROOT,
    allowedRoutes: [
      AppRoutes.ROOT,
      AppRoutes.ORDERS,
      AppRoutes.KDS,
      AppRoutes.MENU,
      AppRoutes.CATEGORIES,
      AppRoutes.CUSTOMERS,
      AppRoutes.VOUCHERS,
      AppRoutes.REVIEWS,
      AppRoutes.STAFF,
      AppRoutes.SETTINGS,
    ],
    themeColor: {
      bg: 'bg-orange-500/15',
      text: 'text-orange-400',
      border: 'border-orange-500/30',
      ring: 'ring-orange-500/40',
      dot: 'bg-orange-500',
    },
  },
  manager: {
    role: 'manager',
    title: 'Operations Manager',
    badge: 'Store Manager',
    description: 'Day-to-day restaurant management, menu catalog, vouchers, reviews, and orders.',
    defaultRoute: AppRoutes.ROOT,
    allowedRoutes: [
      AppRoutes.ROOT,
      AppRoutes.ORDERS,
      AppRoutes.MENU,
      AppRoutes.CATEGORIES,
      AppRoutes.CUSTOMERS,
      AppRoutes.VOUCHERS,
      AppRoutes.REVIEWS,
      AppRoutes.STAFF,
    ],
    themeColor: {
      bg: 'bg-sky-500/15',
      text: 'text-sky-400',
      border: 'border-sky-500/30',
      ring: 'ring-sky-500/40',
      dot: 'bg-sky-500',
    },
  },
  kitchen: {
    role: 'kitchen',
    title: 'Head Chef / Line Cook',
    badge: 'Kitchen Chef',
    description: 'Kitchen Display System (KDS), ticket timing, and menu 86 availability.',
    defaultRoute: AppRoutes.KDS,
    allowedRoutes: [
      AppRoutes.KDS,
      AppRoutes.MENU,
    ],
    themeColor: {
      bg: 'bg-emerald-500/15',
      text: 'text-emerald-400',
      border: 'border-emerald-500/30',
      ring: 'ring-emerald-500/40',
      dot: 'bg-emerald-500',
    },
  },
  staff: {
    role: 'staff',
    title: 'Cashier / Front Desk',
    badge: 'Front Staff',
    description: 'Live order desk, customer pickup status, receipt printing, and order lookup.',
    defaultRoute: AppRoutes.ORDERS,
    allowedRoutes: [
      AppRoutes.ORDERS,
      AppRoutes.KDS,
      AppRoutes.MENU,
    ],
    themeColor: {
      bg: 'bg-purple-500/15',
      text: 'text-purple-400',
      border: 'border-purple-500/30',
      ring: 'ring-purple-500/40',
      dot: 'bg-purple-500',
    },
  },
  user: {
    role: 'user',
    title: 'Customer',
    badge: 'Diner',
    description: 'Customer ordering view',
    defaultRoute: AppRoutes.ROOT,
    allowedRoutes: [AppRoutes.ROOT],
    themeColor: {
      bg: 'bg-slate-500/15',
      text: 'text-slate-400',
      border: 'border-slate-500/30',
      ring: 'ring-slate-500/40',
      dot: 'bg-slate-500',
    },
  },
};

export function getRoleConfig(role: string | undefined): RoleConfig {
  const normalized = (role || 'admin').toLowerCase() as UserRole;
  return ROLE_CONFIGS[normalized] || ROLE_CONFIGS.admin;
}

export function isRouteAllowedForRole(routePath: string, role: string | undefined): boolean {
  const config = getRoleConfig(role);
  // Match path directly or prefix (e.g. nested routes)
  return config.allowedRoutes.some((allowed) => {
    if (allowed === AppRoutes.ROOT) return routePath === AppRoutes.ROOT;
    return routePath.startsWith(allowed);
  });
}
