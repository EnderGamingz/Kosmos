import {
  CheckBadgeIcon,
  InformationCircleIcon,
  KeyIcon,
  UserIcon,
  WindowIcon,
} from '@heroicons/react/24/outline';

export const links = [
  {
    name: 'Account',
    href: '/settings/account',
    icon: UserIcon,
  },
  {
    name: 'Security',
    href: '/settings/security',
    icon: KeyIcon,
  },
  {
    name: 'Preferences',
    href: '/settings/preferences',
    icon: WindowIcon,
  },
  {
    name: 'Dismissed',
    href: '/settings/dismissed',
    icon: CheckBadgeIcon,
  },
  {
    name: 'Kosmos',
    href: '/settings/info',
    icon: InformationCircleIcon,
    bottom: true,
  },
];
