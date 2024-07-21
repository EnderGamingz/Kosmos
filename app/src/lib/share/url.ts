import { DataOperationType } from '@models/file.ts';
import { LOCAL_URL } from '@lib/env.ts';

export function getShareUrl(
  type: DataOperationType,
  uuid: string,
  local?: boolean,
) {
  return `${local ? '/' : LOCAL_URL}s/${type}/${uuid}`;
}
