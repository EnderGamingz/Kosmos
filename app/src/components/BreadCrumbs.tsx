import ConditionalWrapper from './ConditionalWrapper.tsx';
import { Link } from 'react-router-dom';
import { ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import tw from '@lib/classMerge.ts';

export default function BreadCrumbs({ children }: { children: ReactNode[] }) {
  return (
    <div className={'flex items-center gap-2 px-5 py-2'}>
      <AnimatePresence>{children}</AnimatePresence>
    </div>
  );
}

export function BreadCrumbItem({
  name,
  href,
  last,
  onMouseEnter,
  onMouseLeave,
}: {
  name: ReactNode;
  href?: string;
  last?: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}) {
  return (
    <motion.div
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={
        'flex items-center gap-2 text-stone-800 [&_svg]:h-5 [&_svg]:w-5'
      }
      initial={{ x: -10, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 10, opacity: 0 }}>
      <ConditionalWrapper
        key={`breadcrumb-${href}`}
        condition={!!href}
        wrapper={c => <Link to={href!}>{c}</Link>}>
        {name}
      </ConditionalWrapper>
      <span
        className={tw(
          'text-stone-500/70 transition-opacity',
          last ? 'opacity-0' : 'opacity-100',
        )}>
        /
      </span>
    </motion.div>
  );
}
