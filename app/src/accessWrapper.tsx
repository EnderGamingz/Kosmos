import { ReactNode } from 'react';
import { useUserState } from '@stores/userStore';

export function AccessWrapper({ el, page }: { el: ReactNode; page: string }) {
  const user = useUserState();

  if (!user.initialized) {
    return 'Loading';
  }

  if (user.user) return el;

  return 'No access to ' + page;
}
