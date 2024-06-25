import { ReactNode } from 'react';
import { useUserState } from '@stores/userStore';
import { NoAccess } from '@components/noAccess.tsx';

export function AccessWrapper({ el, page }: { el: ReactNode; page: string }) {
  const user = useUserState();

  if (!user.initialized) {
    return <NoAccess loading page={page} />;
  }

  if (user.error) {
    return <NoAccess error={user.error} page={page} />;
  }

  if (user.user) return el;

  return <NoAccess page={page} />;
}
