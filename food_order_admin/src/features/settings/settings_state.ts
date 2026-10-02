import { AppConfig } from '../../core/config/app_config';

export interface RestaurantProfile {
  name: string;
  phone: string;
  address: string;
  autoAcceptOrders: boolean;
  soundAlerts: boolean;
  maxConcurrentOrders: number;
}

export interface SettingsState {
  profile: RestaurantProfile;
  isTestingApi: boolean;
  apiStatus: 'connected' | 'offline' | 'untested';
  isSavedToastVisible: boolean;
}

export const initialSettingsState: SettingsState = {
  profile: {
    name: AppConfig.restaurantName,
    phone: AppConfig.restaurantPhone,
    address: AppConfig.restaurantAddress,
    autoAcceptOrders: false,
    soundAlerts: true,
    maxConcurrentOrders: 25,
  },
  isTestingApi: false,
  apiStatus: 'untested',
  isSavedToastVisible: false,
};
