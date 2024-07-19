import ConditionalWrapper from '@components/ConditionalWrapper.tsx';
import Illustration from '@components/Illustration.tsx';
import tw from '@lib/classMerge.ts';
import { motion } from 'framer-motion';

export default function EmptyList({
  table,
  grid,
}: {
  table?: boolean;
  grid?: boolean;
}) {
  return (
    <ConditionalWrapper
      condition={table}
      wrapper={c => (
        <tr>
          <td colSpan={5}>{c}</td>
        </tr>
      )}>
      <motion.div
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className={tw(
          'grid w-full flex-grow place-items-center gap-4 px-2 py-4 opacity-70',
          grid
            ? 'col-span-1 sm:col-span-2 md:col-span-3 lg:col-span-4 xl:col-span-5 2xl:col-span-7'
            : '',
        )}>
        <Illustration.NoData className={'h-20 w-20'} />
        <motion.p
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className={'text-center text-stone-700'}>
          No items
        </motion.p>
      </motion.div>
    </ConditionalWrapper>
  );
}
