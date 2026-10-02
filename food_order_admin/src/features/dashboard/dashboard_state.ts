/**
 * Model / State (M) in MVI for Dashboard
 */
export interface ChartDataPoint {
  label: string;
  value: number;
  orders: number;
  percentage: number;
}

export interface DashboardState {
  chartPeriod: 'day' | 'week' | 'month';
  weekData: ChartDataPoint[];
  lastRefreshed: Date;
}

export const initialDashboardState: DashboardState = {
  chartPeriod: 'week',
  weekData: [
    { label: 'Mon', value: 1240, orders: 48, percentage: 65 },
    { label: 'Tue', value: 1480, orders: 54, percentage: 76 },
    { label: 'Wed', value: 1120, orders: 42, percentage: 58 },
    { label: 'Thu', value: 1690, orders: 62, percentage: 84 },
    { label: 'Fri', value: 2350, orders: 95, percentage: 100 },
    { label: 'Sat', value: 2180, orders: 88, percentage: 92 },
    { label: 'Sun', value: 1890, orders: 74, percentage: 80 },
  ],
  lastRefreshed: new Date(),
};
