import ExplorerPreferences from '@pages/settings/preferences/explorerPreference.tsx';
import { UnitPreferences } from '@pages/settings/preferences/unitPreferences.tsx';
import { ThemePreferences } from '@pages/settings/preferences/themePreferences.tsx';
import { cn } from '@lib/utils.ts';
import { PageMetadata } from '@components/metadata.tsx';

export default function Preferences({ inPopup }: { inPopup?: boolean }) {
  return (
    <div className={'space-y-3'}>
      <h1 className={cn('font-bold', inPopup ? 'text-xl' : 'text-3xl')}>
        Preferences
      </h1>
      <PageMetadata title={'Preferences'} />
      <UnitPreferences inPopup={inPopup} />
      <ThemePreferences inPopup={inPopup} />
      <ExplorerPreferences inPopup={inPopup} />
    </div>
  );
}
