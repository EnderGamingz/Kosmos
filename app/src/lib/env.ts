/* Environment Variables */
export const {
  VITE_BASE_URL: BASE_URL,
  VITE_LOCAL_URL: LOCAL_URL,
  CF_PAGES_COMMIT_SHA: BUILD_ID,
  WORKERS_CI_COMMIT_SHA: BUILD_TAG,
  VITE_PUSH_PUBLIC_BASE64: PUSH_PUBLIC_BASE64,
} = import.meta.env;

export const ALLOW_REGISTER = import.meta.env.VITE_ALLOW_REGISTER === 'true';
export const SYSTEM_MESSAGE = import.meta.env.VITE_SYSTEM_MESSAGE || undefined;
