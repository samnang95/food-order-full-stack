import { defineStore } from 'pinia';
import { reactive, computed } from 'vue';
import { DashboardIntentType, type DashboardIntent, DashboardIntents } from '../dashboard_intent';
import { initialDashboardState, type DashboardState } from '../dashboard_state';

export const useDashboardStore = defineStore('dashboard', () => {
  const state = reactive<DashboardState>({ ...initialDashboardState });

  function dispatch(intent: DashboardIntent) {
    switch (intent.type) {
      case DashboardIntentType.SET_CHART_PERIOD: {
        state.chartPeriod = intent.payload;
        break;
      }
      case DashboardIntentType.REFRESH_METRICS: {
        state.lastRefreshed = new Date();
        break;
      }
    }
  }

  const chartPeriod = computed({
    get: () => state.chartPeriod,
    set: (p: 'day' | 'week' | 'month') => dispatch(DashboardIntents.setChartPeriod(p)),
  });
  const weekData = computed(() => state.weekData);

  return {
    state,
    dispatch,
    chartPeriod,
    weekData,
    setChartPeriod: (period: 'day' | 'week' | 'month') => dispatch(DashboardIntents.setChartPeriod(period)),
  };
});
