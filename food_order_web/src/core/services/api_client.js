import { AppConfig } from '../config/app_config';

const BASE_URL = AppConfig.apiBaseUrl;
const TOKEN_KEY = 'bitecraft_auth_token';

export const ApiClient = {
  getToken() {
    return localStorage.getItem(TOKEN_KEY) || null;
  },

  setToken(token) {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  },

  clearToken() {
    localStorage.removeItem(TOKEN_KEY);
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

