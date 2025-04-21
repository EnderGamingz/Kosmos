import { ReactNode } from 'react';
import {
  ArrowLeft,
  BookUser,
  Clock,
  Cloud,
  Ellipsis,
  Home,
  Images,
  MessageSquare,
  Share2,
  Star,
  Trash2,
  User,
} from 'lucide-react';

export type ExplorerLink = {
  name: string;
  icon: ReactNode;
  href?: string;
  exact?: boolean;
  description?: string;
  lessPriority?: boolean;
  onlyBottom?: boolean;
  items?: ExplorerLink[];
};

export const getExplorerLinks = (binUsage?: string): ExplorerLink[] => [
  {
    name: 'Home',
    href: '/home',
    icon: <Home />,
    exact: true,
  },
  {
    name: 'Albums',
    href: '/home/album',
    icon: <Images />,
  },
  {
    name: 'Recent',
    href: '/home/recent',
    icon: <Clock />,
    lessPriority: true,
  },
  {
    name: 'Favorites',
    href: '/home/favorites',
    icon: <Star />,
    lessPriority: true,
  },
  {
    name: 'Share',
    icon: <Share2 />,
    items: [
      {
        name: 'Shared with me',
        href: '/home/shares',
        icon: <User />,
      },
      {
        name: 'My shares',
        href: '/home/shared',
        icon: <Cloud />,
      },
    ],
  },
  {
    name: 'Bin',
    href: '/home/bin',
    description: binUsage,
    icon: <Trash2 />,
    lessPriority: true,
  },
];

export const getBottomMoreLinks = (links: ExplorerLink[]): ExplorerLink => ({
  name: 'More',
  icon: <Ellipsis />,
  items: links.filter(link => link.lessPriority === true),
});

export const getAdminLinks = (): ExplorerLink[] => [
  {
    name: 'User',
    href: '/admin/user',
    icon: <User />,
  },
];

export const getSocialLinks = (): ExplorerLink[] => [
  {
    name: 'Home',
    href: '/social',
    icon: <Home />,
    exact: true,
  },
  {
    name: 'Chats',
    href: '/social/chats',
    icon: <MessageSquare />,
  },
  {
    name: 'Contacts',
    href: '/social/contacts',
    icon: <BookUser />,
  },
  {
    name: 'Back',
    href: '/home',
    icon: <ArrowLeft />,
    onlyBottom: true,
  },
];
