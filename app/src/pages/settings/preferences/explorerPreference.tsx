import { useState } from 'react';
import { usePreferenceStore } from '@stores/preferenceStore.ts';
import {
  ExplorerStylePreference,
  PreferenceOption,
  selections,
} from '@pages/settings/preferences/selections.tsx';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import tw from '@utils/classMerge.ts';
import { Collapse } from 'react-collapse';
import { motion } from 'framer-motion';
import {
  containerVariant,
  itemTransitionVariantFadeInFromTop,
} from '@components/defaults/transition.ts';

export default function ExplorerPreferences({
  inPopup,
}: {
  inPopup?: boolean;
}) {
  const pref = usePreferenceStore();
  const items = selections(pref);

  return (
    <section className={'space-y-3'}>
      <h2 className={'text-xl font-semibold'}>File Explorer Style</h2>
      <motion.div
        variants={containerVariant()}
        initial={'hidden'}
        animate={'show'}
        className={tw(
          'space-y-3',
          Boolean(inPopup) && 'max-h-[350px] overflow-y-auto scrollbar-hide',
        )}>
        {items.map(item => (
          <Preference small={inPopup} key={item.name} item={item} />
        ))}
      </motion.div>
    </section>
  );
}

export function Preference({
  item,
  small,
}: {
  item: ExplorerStylePreference;
  small?: boolean;
}) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      variants={itemTransitionVariantFadeInFromTop}
      className={tw(
        'w-full rounded-xl bg-stone-400/10 p-3 shadow transition-colors',
        'outline outline-1 outline-transparent',
        open && 'shadow-md outline-stone-500/20',
        Boolean(small) && 'p-2 shadow-none',
      )}>
      <div
        onClick={() => setOpen(prev => !prev)}
        className={'flex cursor-pointer items-center justify-between'}>
        <div
          className={tw(
            'flex items-center gap-3 text-stone-600 [&_svg]:h-8 [&_svg]:w-8',
            Boolean(small) && 'gap-2 [&_svg]:h-6 [&_svg]:w-6',
          )}>
          {item.icon}
          <div>
            <h3
              className={tw(
                'text-lg font-medium',
                Boolean(small) && 'text-base',
              )}>
              {item.name}
            </h3>
            <p className={tw('text-sm', Boolean(small) && 'text-xs')}>
              {item.type.getName(item.type.current)}
            </p>
          </div>
        </div>
        <ChevronDownIcon
          className={tw('h-5 w-5 transition-transform', open && 'rotate-180')}
        />
      </div>
      <Collapse isOpened={open}>
        <div className={'space-y-1 p-3'}>
          <motion.h4
            className={'font-extralight'}
            variants={itemTransitionVariantFadeInFromTop}>
            Display as
          </motion.h4>
          <motion.div
            variants={containerVariant()}
            initial={'hidden'}
            animate={open && 'show'}
            key={`options-${open}-type`}
            className={'flex flex-col gap-3 sm:flex-row'}>
            {item.type.options.map(option => (
              <PreferenceSelection
                small={small}
                item={option}
                selected={item.type.current === option.value}
                onSelect={item.type.onChange}
                key={`${option.name}-type`}
                type={`${item.name}-type`}
              />
            ))}
          </motion.div>
        </div>
        {item.details && (
          <div className={'space-y-1 p-3 pt-2'}>
            <motion.h4
              className={'font-extralight'}
              variants={itemTransitionVariantFadeInFromTop}>
              Details
            </motion.h4>
            <motion.div
              variants={containerVariant(0.04, 0.1)}
              initial={'hidden'}
              animate={open && 'show'}
              key={`options-${open}-details`}
              className={'flex flex-col gap-3 sm:flex-row'}>
              {item.details.options.map(option => (
                <PreferenceSelection
                  small={small}
                  item={option}
                  selected={item.details!.current === option.value}
                  onSelect={item.details!.onChange}
                  key={`${option.name}-details`}
                  type={`${item.name}-details`}
                />
              ))}
            </motion.div>
          </div>
        )}
      </Collapse>
    </motion.div>
  );
}

export function PreferenceSelection({
  item,
  selected,
  onSelect,
  type,
  small,
}: {
  item: PreferenceOption;
  selected: boolean;
  onSelect: (value: number) => void;
  type: string;
  small?: boolean;
}) {
  return (
    <motion.button
      key={`${item.name}-${item.name}`}
      variants={itemTransitionVariantFadeInFromTop}
      onClick={() => onSelect(item.value)}
      className={tw(
        'relative flex flex-1 items-center gap-3 p-3 text-lg text-stone-600',
        'isolate rounded-lg bg-stone-500/10 hover:bg-stone-500/20',
        'transition-colors [&_svg]:h-6 [&_svg]:w-6',
        Boolean(small) && 'gap-2 p-2 text-sm [&_svg]:h-4 [&_svg]:w-4',
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
