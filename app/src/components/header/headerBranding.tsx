import { Link, NavLink, useLocation } from 'react-router-dom';
import ApplicationIcon from '@components/defaults/icon.tsx';
import { motion } from 'framer-motion';
import type { UserModelDTO } from '@bindings/UserModelDTO.ts';
import { cn } from '@lib/utils.ts';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@components/ui/popover.tsx';
import { ChevronDown, Cloud, MessageSquare } from 'lucide-react';
import { PopoverClose } from '@radix-ui/react-popover';
import { ContactQuery } from '@lib/queries/contactQuery.ts';
import { AttentionDot } from '@components/header/attentionDot.tsx';

export const kosmosParts = [
  {
    title: 'Cloud',
    icon: Cloud,
    link: '/home',
  },
  {
    title: 'Social',
    icon: MessageSquare,
    link: '/social',
  },
];

export function HeaderBranding({
  user,
  expanded,
  onClick,
  noPartSwitcher,
}: {
  user?: UserModelDTO;
  expanded?: boolean;
  onClick?: () => void;
  noPartSwitcher?: boolean;
}) {
  if (!user || noPartSwitcher)
    return (
      <motion.div
        className={
          'min-w-max flex items-center gap-2 text-stone-700 dark:text-stone-400'
        }
        layout={'position'}
        layoutId={'header-branding'}
      >
        <Link
          onClick={onClick}
          to={user ? '/home' : '/'}
          className={
            'rounded-lg p-2 flex gap-4 transition-all hover:bg-stone-700/5  dark:hover:bg-stone-300/20'
          }
        >
          <ApplicationIcon className={'h-8 w-8'} />
          <span
            className={cn(
              'sm:flex gap-1.5 items-center',
              !expanded && 'hidden',
            )}
          >
            <span className={'text-2xl font-bold'}>Kosmos</span>
          </span>
        </Link>
      </motion.div>
    );

  return (
    <motion.div
      className={
        'min-w-max flex items-center gap-2 text-stone-700 dark:text-stone-400'
      }
      layout={'position'}
      layoutId={'header-branding'}
    >
      <Link
        onClick={onClick}
        to={user ? '/home' : '/'}
        className={
          'rounded-lg p-2 transition-all hover:bg-stone-700/5  dark:hover:bg-stone-300/20'
        }
      >
        <ApplicationIcon className={'h-8 w-8'} />
      </Link>
      <HeaderBrandingSitePartSwitcher expanded={expanded} />
    </motion.div>
  );
}

export function HeaderBrandingSitePartSwitcher({
  expanded,
  noBrand,
}: {
  expanded?: boolean;
  noBrand?: boolean;
}) {
  const attention = ContactQuery.useRequiresAttention();

  const path = useLocation().pathname;
  const currentPath = kosmosParts.find(part => path.startsWith(part.link));

  const fallbackTitle = 'The Void';
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type={'button'}
          className={cn(
            'sm:flex gap-2 cursor-pointer items-center relative',
            !expanded && 'hidden',
          )}
        >
          {attention.data && (
            <AttentionDot className={'bg-red-400 right-3 top-0'} />
          )}
          {!noBrand && <span className={'text-2xl font-bold'}>Kosmos</span>}
          <div
            title={'Current location'}
            className={'flex flex-col items-start text-lg w-max'}
          >
            <span
              className={'text-primary tracking-wider flex items-center gap-1'}
            >
              {currentPath?.title ?? fallbackTitle}
              <ChevronDown className={'w-4 h-4'} />
            </span>
            <span className={'md:hidden text-xs text-muted-foreground'}>
              Current location
            </span>
          </div>
        </button>
      </PopoverTrigger>
      <PopoverContent
        side={'bottom'}
        align={'start'}
        className={'w-44 p-2 flex flex-col gap-1'}
      >
        {/* Fallback explanation */}
        {!currentPath && (
          <div className={'animate-fade-in-top'}>
            <p className={'text-center text-sm text-muted-foreground'}>
              You're drifting in uncharted space.
            </p>
            <hr className={'my-1'} />
          </div>
        )}
        {kosmosParts.map((part, i) => (
          <PopoverClose asChild key={part.title}>
            <NavLink
              to={part.link}
              style={{ animationDelay: `${i * 0.1}s` }}
              className={cn(
                'menu-button aria-[current]:font-bold',
                'animate-fade-in-top relative',
                'hover:bg-stone-700/5 dark:hover:bg-stone-300/20',
              )}
            >
              {part.link.includes('social') && attention.data && (
                <AttentionDot
                  className={'bg-red-400 top-1/2 -translate-y-1/2 right-2'}
                />
              )}
              <part.icon className={'h-6 w-6'} />
              {part.title}
            </NavLink>
          </PopoverClose>
        ))}
      </PopoverContent>
    </Popover>
  );
}
