import { ShareType } from '@models/share.ts';
import { EyeIcon, LockClosedIcon } from '@heroicons/react/24/outline';

export function getShareTypeIcon(type: ShareType) {
  switch (type) {
    case ShareType.Public:
      return <EyeIcon className={'w-4'} />;
    case ShareType.Private:
    default:
      return <LockClosedIcon className={'w-4'} />;
  }
}