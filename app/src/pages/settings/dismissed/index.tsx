import { useDismissStore } from '@stores/dismissStore.ts';
import EmptyList from '@pages/explorer/components/EmptyList.tsx';
import { AnimatePresence, motion } from 'framer-motion';
import {
  containerVariant,
  itemTransitionVariantFadeInFromTopSmall,
} from '@components/defaults/transition.ts';

export default function DismissedOverview() {
  const dismissStore = useDismissStore();
  const dismissed = dismissStore.getDismissed();

  return (
    <div className={'space-y-3'}>
      <h1 className={'text-3xl font-bold'}>Dismissed Messages</h1>
      <motion.ul
        variants={containerVariant()}
        initial={'hidden'}
        animate={'show'}
        className={'space-y-3'}>
        {!dismissed.length && <EmptyList message={'No dismissed messages'} />}
        <AnimatePresence>
          {dismissed.map(item => {
            return (
              <motion.li
                layout
                variants={itemTransitionVariantFadeInFromTopSmall}
                key={item.id}
                className={
                  'flex flex-col items-start gap-2 rounded-lg bg-stone-200 p-2 text-stone-800 md:flex-row md:items-center'
                }>
                <div className={'flex items-center gap-2'}>
                  <item.icon className={'h-5 w-5'} />
                  {item.name}
                </div>
                <button
                  onClick={() => dismissStore.actions.reset(item.id)}
                  className={
                    'ml-auto rounded bg-stone-600 px-3 py-1 text-stone-50'
                  }>
                  Reset
                </button>
              </motion.li>
            );
          })}
        </AnimatePresence>
      </motion.ul>
    </div>
  );
}
