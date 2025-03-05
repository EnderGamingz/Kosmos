import {
  CheckBadgeIcon,
  InformationCircleIcon,
  KeyIcon,
  UserIcon,
  WindowIcon,
} from '@heroicons/react/24/outline';
import { ExplorerLink } from '@pages/explorer/nav/explorerLinks.tsx';

export const getSettingsLinks = (): ExplorerLink[] => [
  {
    name: 'Account',
    href: '/settings/account',
    icon: <UserIcon />,
  },
  {
    name: 'Security',
    href: '/settings/security',
    icon: <KeyIcon />,
  },
  {
    name: 'Profile',
    href: '/settings/profile',
    icon: <UserIcon />,
    lessPriority: true,
  },
  {
    name: 'Preferences',
    href: '/settings/preferences',
    icon: <WindowIcon />,
  },
  {
    name: 'Dismissed',
    href: '/settings/dismissed',
    icon: <CheckBadgeIcon />,
    lessPriority: true,
  },
  {
    name: 'Kosmos',
    href: '/settings/info',
    icon: <InformationCircleIcon />,
    lessPriority: true,
  },
];
