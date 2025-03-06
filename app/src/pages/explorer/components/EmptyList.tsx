import ConditionalWrapper from '@components/wrappers/ConditionalWrapper.tsx';
import Illustration from '@components/Illustration.tsx';
import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { cn } from '@lib/utils.ts';

export default function EmptyList({
  table,
  grid,
  message,
  noIcon,
  action,
}: {
  table?: boolean;
  grid?: boolean;
  message?: string;
  noIcon?: boolean;
  action?: ReactNode;
}) {
  return (
    <ConditionalWrapper
      condition={table}
      wrapper={c => (
        <motion.tfoot layout>
          <tr>
            <td colSpan={5}>{c}</td>
          </tr>
        </motion.tfoot>
      )}>
      <div
        className={cn(
          'grid w-full flex-grow place-items-center gap-4 px-2 py-4 animate-fade-in-top delay-200',
          grid
            ? 'col-span-1 sm:col-span-2 md:col-span-3 lg:col-span-4 xl:col-span-5 2xl:col-span-7'
            : '',
        )}>
        {!noIcon && <Illustration.NoData className={'h-20 w-20'} />}
        <p
          className={
            'text-center text-stone-600 dark:text-stone-400 animate-fade-in-top delay-300'
          }>
          {message ?? 'No items'}
        </p>
        <div className={'animate-fade-in-top delay-400'}>{action}</div>
      </div>
    </ConditionalWrapper>
  );
}
