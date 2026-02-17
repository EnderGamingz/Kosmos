import { Unit, usePreferenceStore } from '@stores/preferenceStore.ts';
import type { PreferenceOption } from '@pages/settings/preferences/selections.tsx';
import { PreferenceSelection } from '@pages/settings/preferences/explorerPreference.tsx';
import { SettingsSubtitle } from '@pages/settings/settingsTitle.tsx';
import { Container, Cuboid } from 'lucide-react';

export function UnitPreferences({ inPopup }: { inPopup?: boolean }) {
  const unitPref = usePreferenceStore(s => s.unit);

  const choices: PreferenceOption[] = [
    {
      name: 'SI',
      description: 'KB / MB',
      value: Unit.SI,
      icon: <Cuboid />,
    },
    {
      name: 'IEC',
      description: 'KiB / MiB',
      value: Unit.IEC,
      icon: <Container />,
    },
  ];
  return (
    <section className={'space-y-3'}>
      <SettingsSubtitle title={'Explorer Units'} />
      <div className={'flex flex-col gap-3 sm:flex-row'}>
        {choices.map((option, i) => (
          <PreferenceSelection
            small={inPopup}
            item={option}
            selected={unitPref.type === option.value}
            onSelect={unitPref.setType}
            key={`${option.name}-choice`}
            type={`unit-choice`}
            index={i}
          />
        ))}
      </div>
    </section>
  );
}
