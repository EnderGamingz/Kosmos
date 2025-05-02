import axios from 'axios';
import { BASE_URL } from '@lib/env.ts';
import { JWT_TOKEN_STORAGE_KEY } from '@lib/constants.ts';

export const api = axios.create({
  baseURL: BASE_URL,
});

api.defaults.withCredentials = true;

api.interceptors.request.use(config => {
  const token = localStorage.getItem(JWT_TOKEN_STORAGE_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
