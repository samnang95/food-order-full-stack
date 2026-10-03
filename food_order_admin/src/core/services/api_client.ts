import axios, { type AxiosInstance } from 'axios';
import { AppConfig } from '../config/app_config';
import { LocalDB } from '../db/local_db';
import { DBKeys } from '../db/db_keys';

export const apiClient: AxiosInstance = axios.create({
  baseURL: AppConfig.apiBaseUrl,
  timeout: AppConfig.timeoutMs,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = LocalDB.getString(DBKeys.AUTH_TOKEN) || 'demo_jwt_token_admin';
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export async function checkApiHealth(): Promise<boolean> {
  try {
    const res = await apiClient.get('/health');
    return res.status === 200;
  } catch {
    return false;
  }
}
