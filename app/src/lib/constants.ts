import { enUS } from 'date-fns/locale/en-US';
/* Constants */
export const FALLBACK_STORAGE_LIMIT = 10 * 1024 * 1024 * 1024; // 10 GiB
export const IMAGE_LOAD_SIZE_THRESHOLD = 75 * 1024 * 1024; // 75 MiB
export const UPLOAD_CHUNK_SIZE = 400;
export const CONTEXT_MENU_WIDTH = 230;
export const CONTEXT_MENU_HEIGHT = 380;

export const FILE_TABLE_ITEM_HEIGHT = 48;
export const FILE_GRID_ROW_HEIGHT_DEFAULT = 182;
export const FILE_GRID_ROW_HEIGHT_COMPACT = 136;
export const MOBILE_FILE_LIST_ITEM_HEIGHT = 64;

export const MAX_QUICK_SHARE_FILES = 100;
export const APP_TIME_LOCALE = enUS;

export const WEBSOCKET_ENDPOINT = 'auth/presence';
