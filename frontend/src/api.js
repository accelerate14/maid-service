import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(token);
    }
  });
  failedQueue = [];
};

// Intercept requests to attach the auth token and log the request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Frontend Logging: Request
  console.log(`[API REQUEST] ${config.method.toUpperCase()} ${config.url}`, config.data || '');
  
  return config;
}, (error) => {
  console.error(`[API REQUEST ERROR]`, error);
  return Promise.reject(error);
});

const clearAuthAndRedirect = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
  delete api.defaults.headers.common.Authorization;
  window.location.href = '/login';
};

const isPublicAuthRequest = (url = '') => {
  return [
    '/auth/login',
    '/auth/register',
    '/auth/forgot-password',
    '/auth/reset-password',
  ].some((path) => url.includes(path));
};

// Intercept responses for logging and refreshing expired access tokens
api.interceptors.response.use((response) => {
  // Frontend Logging: Response
  console.log(`[API RESPONSE] ${response.config.method.toUpperCase()} ${response.config.url} - Status: ${response.status}`, response.data);
  return response;
}, async (error) => {
  const originalRequest = error.config;
  const status = error.response?.status;
  const isRefreshRequest = originalRequest?.url?.includes('/auth/refresh-token');
  const isPublicAuthRequestCall = isPublicAuthRequest(originalRequest?.url || '');

  if (isPublicAuthRequestCall) {
    return Promise.reject(error);
  }

  if ((status === 401 || status === 403) && isRefreshRequest) {
    clearAuthAndRedirect();
    return Promise.reject(error);
  }

  if (status === 401 && !originalRequest._retry) {
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((token) => {
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      }).catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await api.post('/auth/refresh-token', { refreshToken });
      const { accessToken, refreshToken: newRefreshToken } = response.data;

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', newRefreshToken);
      api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
      originalRequest.headers.Authorization = `Bearer ${accessToken}`;

      processQueue(null, accessToken);
      return api(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      clearAuthAndRedirect();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }

  // If an auth-required request has already retried and still fails, log out immediately
  if (status === 401 && originalRequest._retry) {
    clearAuthAndRedirect();
  }

  // Frontend Logging: Error
  console.error(`[API RESPONSE ERROR] ${error.response?.config?.method?.toUpperCase()} ${error.response?.config?.url} - Status: ${status}`, error.response?.data || error.message);
  return Promise.reject(error);
});

export default api;
