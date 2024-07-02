export const {
  VITE_BASE_URL: BASE_URL,
  DEV: IS_DEVELOPMENT,
  VITE_LOCAL_URL: LOCAL_URL,
} = import.meta.env;

// 10 GiB
export const FALLBACK_STORAGE_LIMIT = 10 * 1024 * 1024 * 1024;
