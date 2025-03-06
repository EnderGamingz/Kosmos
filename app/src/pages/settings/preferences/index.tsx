import ExplorerPreferences from '@pages/settings/preferences/explorerPreference.tsx';
import { UnitPreferences } from '@pages/settings/preferences/unitPreferences.tsx';
import { ThemePreferences } from '@pages/settings/preferences/themePreferences.tsx';
import { cn } from '@lib/utils.ts';
import { SettingsPageMetadata } from '@components/metadata.tsx';
import { SettingsTitle } from '@pages/settings';

export default function Preferences({ inPopup }: { inPopup?: boolean }) {
  return (
    <div className={'space-y-3'}>
      <SettingsTitle
        title={'Preferences'}
        className={cn('font-bold', inPopup ? 'text-xl' : 'text-3xl')}
      />
      <SettingsPageMetadata title={'Preferences'} />
      <UnitPreferences inPopup={inPopup} />
      <ThemePreferences inPopup={inPopup} />
      <ExplorerPreferences inPopup={inPopup} />
    </div>
  );
}
