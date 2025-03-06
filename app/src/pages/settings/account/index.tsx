import { DangerSettings } from '@pages/settings/account/dangerSettings.tsx';
import { UserInformation } from '@pages/settings/account/userInformation.tsx';
import { SettingsPageMetadata } from '@components/metadata.tsx';
import { SettingsTitle } from '@pages/settings';

export default function AccountSettings() {
  return (
    <div className={'space-y-3'}>
      <SettingsTitle title={'Account'} />
      <SettingsPageMetadata title={'Account'} />
      <UserInformation />
      <DangerSettings />
    </div>
  );
}
