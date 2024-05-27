import ConditionalWrapper from './ConditionalWrapper.tsx';
import { Link } from 'react-router-dom';
import { ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import tw from '../lib/classMerge.ts';

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
}: {
  name: string;
  href?: string;
  last?: boolean;
}) {
  return (
    <motion.div
      className={'flex gap-2'}
      initial={{ x: -10, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 10, opacity: 0 }}>
      <ConditionalWrapper
        key={`breadcrumb-${href}`}
        condition={!!href}
        wrapper={c => <Link to={href!}>{c}</Link>}>
        <motion.div className={tw('text-stone-900')}>{name}</motion.div>
      </ConditionalWrapper>
      <span
        className={tw(
          'transition-opacity',
          last ? 'opacity-0' : 'opacity-100',
        )}>
        &gt;
      </span>
    </motion.div>
  );
}
