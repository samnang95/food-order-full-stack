import { AppConfig } from '../config/app_config';
import { LocalDB, DBKeys } from '../db';

const BASE_URL = AppConfig.apiBaseUrl;

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

  async get(endpoint, customHeaders = {}) {
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: this.getHeaders(customHeaders),
      });
      return await this.handleResponse(response);
    } catch (error) {
      console.error(`[ApiClient] GET ${endpoint} failed:`, error);
      throw error;
    }
  },

  async post(endpoint, data, customHeaders = {}) {
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: this.getHeaders(customHeaders),
        body: JSON.stringify(data),
      });
      return await this.handleResponse(response);
    } catch (error) {
      console.error(`[ApiClient] POST ${endpoint} failed:`, error);
      throw error;
    }
  },

  async put(endpoint, data, customHeaders = {}) {
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'PUT',
        headers: this.getHeaders(customHeaders),
        body: JSON.stringify(data),
      });
      return await this.handleResponse(response);
    } catch (error) {
      console.error(`[ApiClient] PUT ${endpoint} failed:`, error);
      throw error;
    }
  },

  async delete(endpoint, customHeaders = {}) {
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'DELETE',
        headers: this.getHeaders(customHeaders),
      });
      return await this.handleResponse(response);
    } catch (error) {
      console.error(`[ApiClient] DELETE ${endpoint} failed:`, error);
      throw error;
    }
  },
};

