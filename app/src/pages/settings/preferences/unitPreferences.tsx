import { Unit, usePreferenceStore } from '@stores/preferenceStore.ts';
import { PreferenceOption } from '@pages/settings/preferences/selections.tsx';
import { ServerIcon, ServerStackIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { containerVariant } from '@components/transition.ts';
import { PreferenceSelection } from '@pages/settings/preferences/explorerPreference.tsx';

export function UnitPreferences({ inPopup }: { inPopup?: boolean }) {
  const unitPref = usePreferenceStore(s => s.unit);

  const choices: PreferenceOption[] = [
    {
      name: 'SI',
      description: 'KB / MB',
      value: Unit.SI,
      icon: <ServerIcon />,
    },
    {
      name: 'IEC',
      description: 'KiB / MiB',
      value: Unit.IEC,
      icon: <ServerStackIcon />,
    },
  ];
  return (
    <section className={'space-y-3'}>
      <h2 className={'text-xl font-semibold'}>Explorer Units</h2>
      <motion.div
        variants={containerVariant(0.04, 0.1)}
        initial={'hidden'}
        animate={'show'}
        className={'flex flex-col gap-3 sm:flex-row'}>
        {choices.map(option => (
          <PreferenceSelection
            small={inPopup}
            item={option}
            selected={unitPref.type === option.value}
            onSelect={unitPref.setType}
            key={`${option.name}-choice`}
            type={`unit-choice`}
          />
        ))}
      </motion.div>
    </section>
  );
}
