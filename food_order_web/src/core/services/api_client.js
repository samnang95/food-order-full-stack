import { AppConfig } from '../config/app_config';
import { LocalDB, DBKeys } from '../db';

const BASE_URL = AppConfig.apiBaseUrl;

let refreshPromise = null;

async function refreshAccessToken() {
  if (refreshPromise) return refreshPromise;

  const refreshToken = ApiClient.getRefreshToken();
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  refreshPromise = (async () => {
    try {
      const response = await fetch(`${BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        ApiClient.clearTokens();
        throw new Error('Failed to refresh access token');
      }

      const data = await response.json();
      if (data?.token) {
        ApiClient.setToken(data.token);
        if (data.refreshToken) {
          ApiClient.setRefreshToken(data.refreshToken);
        }
        return data.token;
      }
      throw new Error('Invalid refresh response');
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

export const ApiClient = {
  getToken() {
    return LocalDB.getString(DBKeys.AUTH_TOKEN);
  },

  setToken(token) {
    if (token) {
      LocalDB.setString(DBKeys.AUTH_TOKEN, token);
    } else {
      LocalDB.remove(DBKeys.AUTH_TOKEN);
    }
  },

  clearToken() {
    LocalDB.remove(DBKeys.AUTH_TOKEN);
  },

  getRefreshToken() {
    return LocalDB.getString(DBKeys.REFRESH_TOKEN);
  },

  setRefreshToken(refreshToken) {
    if (refreshToken) {
      LocalDB.setString(DBKeys.REFRESH_TOKEN, refreshToken);
    } else {
      LocalDB.remove(DBKeys.REFRESH_TOKEN);
    }
  },

  clearRefreshToken() {
    LocalDB.remove(DBKeys.REFRESH_TOKEN);
  },

  clearTokens() {
    this.clearToken();
    this.clearRefreshToken();
  },

  getHeaders(customHeaders = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...customHeaders,
    };
    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  },

  async handleResponse(response) {
    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        if (errorData?.message) errorMessage = errorData.message;
      } catch (err) {
        console.debug('Failed to parse error response JSON:', err);
      }

      throw new Error(errorMessage);
    }
    return await response.json();
  },

  async request(endpoint, options = {}, isRetry = false) {
    const url = `${BASE_URL}${endpoint}`;
    const customHeaders = options.headers || {};
    const headers = this.getHeaders(customHeaders);
    const config = { ...options, headers };

    try {
      const response = await fetch(url, config);

      // Auto-refresh token if 401 returned and not an auth endpoint
      if (response.status === 401 && !isRetry && !endpoint.includes('/auth/')) {
        try {
          const newToken = await refreshAccessToken();
          if (newToken) {
            return await this.request(endpoint, options, true);
          }
        } catch (refreshErr) {
          console.warn('[ApiClient] Silent token refresh failed:', refreshErr);
        }
      }

      return await this.handleResponse(response);
    } catch (error) {
      console.error(`[ApiClient] ${options.method || 'GET'} ${endpoint} failed:`, error);
      throw error;
    }
  },

  async get(endpoint, customHeaders = {}) {
    return this.request(endpoint, { method: 'GET', headers: customHeaders });
  },

  async post(endpoint, data, customHeaders = {}) {
    return this.request(endpoint, {
      method: 'POST',
      headers: customHeaders,
      body: JSON.stringify(data),
    });
  },

  async put(endpoint, data, customHeaders = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      headers: customHeaders,
      body: JSON.stringify(data),
    });
  },

  async delete(endpoint, customHeaders = {}) {
    return this.request(endpoint, { method: 'DELETE', headers: customHeaders });
  },
};

