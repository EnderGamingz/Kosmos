import ExplorerPreferences from '@pages/settings/preferences/explorerPreference.tsx';
import { UnitPreferences } from '@pages/settings/preferences/unitPreferences.tsx';

export default function Preferences() {
  return (
    <div className={'space-y-3'}>
      <h1 className={'text-3xl font-bold'}>Preferences</h1>
      <UnitPreferences />
      <ExplorerPreferences />
    </div>
  );
}
