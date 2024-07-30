import { ReactNode } from 'react';
import {
  ClockIcon,
  CloudIcon,
  EllipsisHorizontalIcon,
  HomeIcon,
  ShareIcon,
  Square2StackIcon,
  StarIcon,
  TrashIcon,
  UserIcon,
} from '@heroicons/react/24/outline';

export type ExplorerLink = {
  name: string;
  icon: ReactNode;
  href?: string;
  exact?: boolean;
  description?: string;
  lessPriority?: boolean;
  items?: ExplorerLink[];
};

export const getExplorerLinks = (binUsage?: string): ExplorerLink[] => [
  {
    name: 'Home',
    href: '/home',
    icon: <HomeIcon />,
    exact: true,
  },
  {
    name: 'Albums',
    href: '/home/album',
    icon: <Square2StackIcon />,
  },
  {
    name: 'Recent',
    href: '/home/recent',
    icon: <ClockIcon />,
    lessPriority: true,
  },
  {
    name: 'Favorites',
    href: '/home/favorites',
    icon: <StarIcon />,
    lessPriority: true,
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
    lessPriority: true,
  },
];

export const getBottomMoreLinks = (): ExplorerLink => ({
  name: 'More',
  icon: <EllipsisHorizontalIcon />,
  items: getExplorerLinks().filter(link => link.lessPriority === true),
});

export const getAdminLinks = (): ExplorerLink[] => [
  {
    name: 'User',
    href: '/admin/user',
    icon: <UserIcon />,
  },
];
