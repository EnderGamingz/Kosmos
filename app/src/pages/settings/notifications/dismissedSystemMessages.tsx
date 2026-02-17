import { useDismissStore } from '@stores/dismissStore.ts';
import { SettingsSubtitle } from '@pages/settings/settingsTitle.tsx';
import EmptyList from '@pages/explorer/components/EmptyList.tsx';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@lib/utils.ts';

export function DismissedSystemMessages() {
  const dismissStore = useDismissStore();
  const dismissed = dismissStore.getDismissed();

  return (
    <>
      <SettingsSubtitle title={'Dismissed System messages'} />
      <ul className={'space-y-3'}>
        {!dismissed.length && <EmptyList message={'No dismissed messages'} />}
        <AnimatePresence>
          {dismissed.map((item, i) => {
            return (
              <motion.li
                layout
                style={{ animationDelay: `${i * 100}ms` }}
                key={item.id}
                className={cn(
                  'flex flex-col items-start gap-2 rounded-lg bg-stone-200 p-2 text-stone-800 md:flex-row md:items-center',
                  'dark:bg-stone-600/40 dark:text-stone-200 animate-fade-in-top',
                )}
              >
                <div className={'flex items-center gap-2'}>
                  <item.icon className={'h-5 w-5'} />
                  {item.name}
                </div>
                <button
                  onClick={() => dismissStore.actions.reset(item.id)}
                  className={
                    'ml-auto rounded bg-stone-600 px-3 py-1 text-stone-50 dark:bg-stone-200 dark:text-stone-800'
                  }
                >
                  Reset
                </button>
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ul>
    </>
  );
}
