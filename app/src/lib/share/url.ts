import { DataOperationType } from '@models/file.ts';
import { LOCAL_URL } from '@lib/vars.ts';

export function getShareUrl(
  type: DataOperationType,
  uuid: string,
  local?: boolean,
) {
  return `${local ? '/' : LOCAL_URL}s/${type}/${uuid}`;
}
