import ExplorerPreferences from '@pages/settings/preferences/explorerPreference.tsx';
import { UnitPreferences } from '@pages/settings/preferences/unitPreferences.tsx';
import { Helmet } from 'react-helmet';
import { ThemePreferences } from '@pages/settings/preferences/themePreferences.tsx';
import { cn } from '@lib/utils.ts';

export default function Preferences({ inPopup }: { inPopup?: boolean }) {
  return (
    <div className={'space-y-3'}>
      <h1 className={cn('font-bold', inPopup ? 'text-xl' : 'text-3xl')}>
        Preferences
      </h1>
      <Helmet>
        <title>Preferences</title>
      </Helmet>
      <UnitPreferences inPopup={inPopup} />
      <ThemePreferences inPopup={inPopup} />
      <ExplorerPreferences inPopup={inPopup} />
    </div>
  );
}
