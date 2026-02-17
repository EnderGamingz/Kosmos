import type { ExplorerLink } from '@pages/explorer/nav/explorerLinks.tsx';
import {
  AppWindow,
  BellRing,
  Info,
  KeyRound,
  User,
  UserPen,
} from 'lucide-react';

export const getSettingsLinks = (): ExplorerLink[] => [
  {
    name: 'Account',
    href: '/settings/account',
    icon: User,
  },
  {
    name: 'Security',
    href: '/settings/security',
    icon: KeyRound,
  },
  {
    name: 'Profile',
    href: '/settings/profile',
    icon: UserPen,
  },
  {
    name: 'Preferences',
    href: '/settings/preferences',
    icon: AppWindow,
  },
  {
    name: 'Notifications',
    href: '/settings/notifications',
    icon: BellRing,
    lessPriority: true,
  },
  {
    name: 'Kosmos',
    href: '/settings/info',
    icon: Info,
    lessPriority: true,
  },
];
