import { ReactNode } from 'react';
import { useUserState } from '@stores/userStore';
import { NoAccess } from '@components/overlay/noAccess.tsx';
import { Role } from '@models/user.ts';

export default function AccessWrapper({
  el,
  page,
  role,
}: {
  el: ReactNode;
  page: string;
  role?: Role;
}) {
  const user = useUserState();

  if (!user.initialized) {
    return <NoAccess loading page={page} />;
  }

  if (user.error) {
    return <NoAccess error={user.error} page={page} />;
  }

  if (role !== undefined && user.user?.role !== role) {
    return <NoAccess isLoggedIn page={page} />;
  }

  if (user.user) return el;

  return <NoAccess page={page} />;
}
