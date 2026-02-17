import { ShareType } from '@models/share.ts';
import { Eye, Lock } from 'lucide-react';

export function getShareTypeIcon(type: ShareType) {
  switch (type) {
    case ShareType.Public:
      return <Eye className={'w-4'} />;
    default:
      return <Lock className={'w-4'} />;
  }
}
