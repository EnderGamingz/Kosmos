import ConditionalWrapper from './wrappers/ConditionalWrapper.tsx';
import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { hexToRGB } from '@utils/color.ts';
import { cn } from '@lib/utils.ts';
import { truncateString } from '@utils/truncate.ts';

export default function BreadCrumbs({ children }: { children: ReactNode[] }) {
  return (
    <div className={'flex flex-wrap items-center gap-1 p-2'}>
      <AnimatePresence>{children}</AnimatePresence>
    </div>
  );
}

export function BreadCrumbItem({
  name,
  href,
  last,
  color,
  onMouseEnter,
  onMouseLeave,
  onClick,
  initial,
}: {
  name: ReactNode;
  href?: string;
  last?: boolean;
  color?: string | null;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  onClick?: () => void;
  initial?: boolean;
}) {
  const hasName = typeof name === 'string';
  const safeName = truncateString(hasName ? name : '', 30);

  return (
    <motion.div
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
      className={
        'flex items-center gap-1 text-stone-800 dark:text-stone-200 [&_svg]:h-5 [&_svg]:w-5'
      }
      initial={{ x: -10, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 10, opacity: 0 }}
    >
      <ConditionalWrapper
        key={`breadcrumb-${href}`}
        condition={!!href}
        wrapper={c => (
          <Link
            className={cn(
              'rounded-md px-1 transition-colors',
              !initial && 'hover:bg-stone-500/10! dark:hover:bg-stone-700/60!',
            )}
            style={{
              backgroundColor: color
                ? `rgba(${hexToRGB(color).join(',')}, 0.2)`
                : undefined,
            }}
            to={href!}
          >
            {c}
          </Link>
        )}
      >
        <span title={hasName && name.length > 30 ? name : undefined}>
          {hasName ? safeName : name}
        </span>
      </ConditionalWrapper>
      <span
        className={cn(
          'text-muted-foreground transition-opacity',
          last && 'opacity-0',
        )}
      >
        /
      </span>
    </motion.div>
  );
}
