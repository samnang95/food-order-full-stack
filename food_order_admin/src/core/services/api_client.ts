import axios, { type AxiosInstance } from 'axios';
import { AppConfig } from '../config/app_config';

export const apiClient: AxiosInstance = axios.create({
  baseURL: AppConfig.apiBaseUrl,
  timeout: AppConfig.timeoutMs,
  headers: {
    'Content-Type': 'application/json',
  },
});

export async function checkApiHealth(): Promise<boolean> {
  try {
    const res = await apiClient.get('/health');
    return res.status === 200;
  } catch {
    return false;
  }
}
