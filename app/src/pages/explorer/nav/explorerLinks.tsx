import {
  ArrowLeft,
  BookUser,
  Clock,
  Home,
  Images,
  MessageSquare,
  Share2,
  Star,
  Trash2,
  User,
} from 'lucide-react';

import { Icon } from '@/types/icon.ts';

export type ExplorerLink = {
  name: string;
  icon: Icon;
  href?: string;
  exact?: boolean;
  description?: string;
  lessPriority?: boolean;
  onlyBottom?: boolean;
};

export const getExplorerLinks = (binUsage?: string): ExplorerLink[] => [
  {
    name: 'Home',
    href: '/home',
    icon: Home,
    exact: true,
  },
  {
    name: 'Favorites',
    href: '/home/favorites',
    icon: Star,
  },
  {
    name: 'Shares',
    icon: Share2,
    href: '/home/share/shared',
  },
  {
    name: 'Albums',
    href: '/home/album',
    icon: Images,
  },
  {
    name: 'Recent',
    href: '/home/recent',
    icon: Clock,
    lessPriority: true,
  },
  {
    name: 'Bin',
    href: '/home/bin',
    description: binUsage,
    icon: Trash2,
    lessPriority: true,
  },
];

export const getAdditionalLinks = (links: ExplorerLink[]): ExplorerLink[] =>
  links.filter(link => link.lessPriority === true);

export const getAdminLinks = (): ExplorerLink[] => [
  {
    name: 'User',
    href: '/admin/user',
    icon: User,
  },
  {
    name: 'Back',
    href: '/home',
    icon: ArrowLeft,
    onlyBottom: true,
  },
];

export const getSocialLinks = (): ExplorerLink[] => [
  {
    name: 'Home',
    href: '/social',
    icon: Home,
    exact: true,
  },
  {
    name: 'Chats',
    href: '/social/chats',
    icon: MessageSquare,
  },
  {
    name: 'Contacts',
    href: '/social/contacts',
    icon: BookUser,
  },
  {
    name: 'Back',
    href: '/home',
    icon: ArrowLeft,
    onlyBottom: true,
  },
];
