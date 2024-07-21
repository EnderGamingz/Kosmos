import { ReactNode } from 'react';
import {
  ClockIcon,
  CloudIcon,
  HomeIcon,
  ShareIcon,
  TrashIcon,
  UserIcon,
} from '@heroicons/react/24/outline';

export type ExplorerLink = {
  name: string;
  icon: ReactNode;
  href?: string;
  description?: string;
  items?: ExplorerLink[];
};

export const getExplorerLinks = (binUsage?: string): ExplorerLink[] => [
  {
    name: 'Home',
    href: '/home',
    icon: <HomeIcon />,
  },
  {
    name: 'Recent',
    href: '/home/recent',
    icon: <ClockIcon />,
  },
  {
    name: 'Share',
    icon: <ShareIcon />,
    items: [
      {
        name: 'Shared with me',
        href: '/home/shares',
        icon: <UserIcon />,
      },
      {
        name: 'My shares',
        href: '/home/shared',
        icon: <CloudIcon />,
      },
    ],
  },
  {
    name: 'Bin',
    href: '/home/bin',
    description: binUsage,
    icon: <TrashIcon />,
  },
];

export const getAdminLinks = (): ExplorerLink[] => [
  {
    name: 'User',
    href: '/admin/user',
    icon: <UserIcon />,
  },
];
