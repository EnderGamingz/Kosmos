import { useState } from 'react';
import { usePreferenceStore } from '@stores/preferenceStore.ts';
import {
  ExplorerStylePreference,
  PreferenceOption,
  selections,
} from '@pages/settings/preferences/selections.tsx';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { Collapse } from 'react-collapse';
import { motion } from 'framer-motion';
import { containerVariant } from '@components/defaults/transition.ts';
import { cn } from '@lib/utils.ts';
import { SettingsSubtitle } from '@pages/settings/settingsTitle.tsx';

export default function ExplorerPreferences({
  inPopup,
}: {
  inPopup?: boolean;
}) {
  const pref = usePreferenceStore();
  const items = selections(pref);

  return (
    <section className={'space-y-3'}>
      <SettingsSubtitle title={'Explorer Style'} />
      <motion.div
        variants={containerVariant(0.04, 0.25)}
        initial={'hidden'}
        animate={'show'}
        className={cn(
          'space-y-3',
          Boolean(inPopup) && 'max-h-[350px] overflow-y-auto scrollbar-hide',
        )}>
        {items.map((item, i) => (
          <Preference small={inPopup} key={item.name} item={item} index={i} />
        ))}
      </motion.div>
    </section>
  );
}

export function Preference({
  item,
  small,
  index,
}: {
  item: ExplorerStylePreference;
  small?: boolean;
  index: number;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div
      style={{ animationDelay: `${(index + 1) * 100}ms` }}
      className={cn(
        'w-full rounded-xl bg-stone-400/10 p-3 shadow',
        'outline outline-transparent animate-fade-in-top',
        open && 'shadow-md outline-stone-500/20',
        Boolean(small) && 'p-2 shadow-none',
        'dark:bg-stone-600/10 dark:outline-stone-300/20',
      )}>
      <div
        onClick={() => setOpen(prev => !prev)}
        className={'flex cursor-pointer items-center justify-between'}>
        <div
          className={cn(
            'flex items-center gap-3 text-stone-600 [&_svg]:h-8 [&_svg]:w-8',
            Boolean(small) && 'gap-2 [&_svg]:h-6 [&_svg]:w-6',
            'dark:text-stone-300',
          )}>
          {item.icon}
          <div>
            <h3
              className={cn(
                'text-lg font-medium',
                Boolean(small) && 'text-base',
              )}>
              {item.name}
            </h3>
            <p className={cn('text-sm', Boolean(small) && 'text-xs')}>
              {item.type.getName(item.type.current)}
            </p>
          </div>
        </div>
        <ChevronDownIcon
          className={cn('h-5 w-5 transition-transform', open && 'rotate-180')}
        />
      </div>
      <Collapse isOpened={open}>
        <div className={'space-y-1 p-3'}>
          <h4
            className={'font-extralight animate-fade-in-left delay-200'}
            key={`type-header-${item.name}${open}`}>
            Display as
          </h4>
          <div
            key={`options-${open}-type`}
            className={'flex flex-col gap-3 sm:flex-row'}>
            {item.type.options.map((option, i) => (
              <PreferenceSelection
                small={small}
                item={option}
                selected={item.type.current === option.value}
                onSelect={item.type.onChange}
                key={`${option.name}-type`}
                type={`${item.name}-type`}
                index={i}
              />
            ))}
          </div>
        </div>
        {item.details && (
          <div className={'space-y-1 p-3 pt-2'}>
            <h4
              className={'font-extralight animate-fade-in-left delay-300'}
              key={`details-header-${item.name}${open}`}>
              Details
            </h4>
            <div
              key={`options-${open}-details`}
              className={'flex flex-col gap-3 sm:flex-row'}>
              {item.details.options.map((option, i) => (
                <PreferenceSelection
                  small={small}
                  item={option}
                  selected={item.details!.current === option.value}
                  onSelect={item.details!.onChange}
                  key={`${option.name}-details`}
                  type={`${item.name}-details`}
                  index={i}
                />
              ))}
            </div>
          </div>
        )}
      </Collapse>
    </div>
  );
}

export function PreferenceSelection({
  item,
  selected,
  onSelect,
  type,
  small,
  index,
  startDelay = 0,
}: {
  item: PreferenceOption;
  selected: boolean;
  onSelect: (value: number) => void;
  type: string;
  small?: boolean;
  index: number;
  startDelay?: number;
}) {
  return (
    <motion.button
      key={`${item.name}-${item.name}`}
      onClick={() => onSelect(item.value)}
      style={{
        animationDelay: `${startDelay + (index + 1) * 100}ms`,
      }}
      className={cn(
        'relative flex flex-1 items-center gap-3 p-3 text-lg text-stone-600',
        'isolate rounded-lg bg-stone-500/10 hover:bg-stone-500/20',
        'transition-colors [&_svg]:h-6 [&_svg]:w-6 animate-fade-in-top',
        Boolean(small) && 'gap-2 p-2 text-sm [&_svg]:h-4 [&_svg]:w-4',
        'dark:text-stone-300 dark:hover:bg-stone-300/20',
      )}>
      {item.icon}
      <div className={'text-start'}>
        <p>{item.name}</p>
        {item.description && <p className={'text-xs'}>{item.description}</p>}
      </div>
      {selected && (
        <motion.div
          layoutId={`selection-${type}`}
          className={'absolute inset-0 -z-10 rounded-lg bg-stone-400/50'}
        />
      )}
    </motion.button>
  );
}
