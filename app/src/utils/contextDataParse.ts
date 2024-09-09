import { ContextData } from '@hooks/useContextMenu.ts';

export function isFileWindow(data: ContextData): data is 'fileWindow' {
  return typeof data === 'string' && data === 'fileWindow';
}
