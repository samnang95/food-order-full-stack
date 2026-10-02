/**
 * Intent (I) in MVI for Dashboard:
 * Actions and user intents for dashboard metrics and chart periods.
 */
export const DashboardIntentType = {
  SET_CHART_PERIOD: 'DASHBOARD/SET_CHART_PERIOD',
  REFRESH_METRICS: 'DASHBOARD/REFRESH_METRICS',
} as const;

export type DashboardIntent =
  | { type: typeof DashboardIntentType.SET_CHART_PERIOD; payload: 'day' | 'week' | 'month' }
  | { type: typeof DashboardIntentType.REFRESH_METRICS };

export const DashboardIntents = {
  setChartPeriod: (period: 'day' | 'week' | 'month'): DashboardIntent => ({
    type: DashboardIntentType.SET_CHART_PERIOD,
    payload: period,
  }),
  refreshMetrics: (): DashboardIntent => ({
    type: DashboardIntentType.REFRESH_METRICS,
  }),
};
