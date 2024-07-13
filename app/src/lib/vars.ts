/* Environment Variables */
export const {
  VITE_BASE_URL: BASE_URL,
  DEV: IS_DEVELOPMENT,
  VITE_LOCAL_URL: LOCAL_URL,
  VITE_BUILD_ID: BUILD_ID,
} = import.meta.env;

/* Constants */
export const FALLBACK_STORAGE_LIMIT = 10 * 1024 * 1024 * 1024; // 10 GiB
export const IMAGE_LOAD_SIZE_THRESHOLD = 75 * 1024 * 1024; // 75 MiB
