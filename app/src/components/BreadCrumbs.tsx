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
}: {
  name: string;
  href?: string;
  last?: boolean;
}) {
  return (
    <motion.div
      className={'flex gap-2 text-stone-800'}
      initial={{ x: -10, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 10, opacity: 0 }}>
      <ConditionalWrapper
        key={`breadcrumb-${href}`}
        condition={!!href}
        wrapper={c => <Link to={href!}>{c}</Link>}>
        <div>{name}</div>
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
