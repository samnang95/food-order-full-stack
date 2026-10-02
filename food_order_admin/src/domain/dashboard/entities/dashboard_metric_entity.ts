export interface DashboardMetricEntity {
  title: string;
  value: string | number;
  change: number;
  isPositive: boolean;
  period: string;
}
