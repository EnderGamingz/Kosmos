import { Theme, usePreferenceStore } from '@stores/preferenceStore.ts';
import { PreferenceOption } from '@pages/settings/preferences/selections.tsx';
import { MoonIcon, SunIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { containerVariant } from '@components/defaults/transition.ts';
import { PreferenceSelection } from '@pages/settings/preferences/explorerPreference.tsx';

export function ThemePreferences({ inPopup }: { inPopup?: boolean }) {
  const themePreferences = usePreferenceStore(s => s.theme);

  const choices: PreferenceOption[] = [
    {
      name: 'Light Theme',
      value: Theme.Light,
      icon: <SunIcon />,
    },
    {
      name: 'Dark Theme',
      value: Theme.Dark,
      icon: <MoonIcon />,
    },
  ];
  return (
    <section className={'space-y-3'}>
      <h2 className={'text-xl font-semibold'}>Application Theme</h2>
      <motion.div
        variants={containerVariant(0.04, 0.2)}
        initial={'hidden'}
        animate={'show'}
        className={'flex flex-col gap-3 sm:flex-row'}>
        {choices.map(option => (
          <PreferenceSelection
            small={inPopup}
            item={option}
            selected={themePreferences.type === option.value}
            onSelect={themePreferences.setType}
            key={`${option.name}-choice`}
            type={`theme-choice`}
          />
        ))}
      </motion.div>
    </section>
  );
}
