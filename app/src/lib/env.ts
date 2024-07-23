/* Environment Variables */
export const {
  VITE_BASE_URL: BASE_URL,
  DEV: IS_DEVELOPMENT,
  VITE_LOCAL_URL: LOCAL_URL,
  VITE_BUILD_ID: BUILD_ID,
  VITE_BUILD_TAG: BUILD_TAG,
} = import.meta.env;

export const ALLOW_REGISTER = import.meta.env.VITE_ALLOW_REGISTER === 'true';
export const SYSTEM_MESSAGE = import.meta.env.VITE_SYSTEM_MESSAGE || undefined;
