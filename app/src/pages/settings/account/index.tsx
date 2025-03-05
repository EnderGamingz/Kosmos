import { DangerSettings } from '@pages/settings/account/dangerSettings.tsx';
import { UserInformation } from '@pages/settings/account/userInformation.tsx';
import { SettingsPageMetadata } from '@components/metadata.tsx';

export default function AccountSettings() {
  return (
    <div className={'space-y-3'}>
      <h1 className={'text-3xl font-bold'}>Account Settings</h1>
      <SettingsPageMetadata title={'Account'} />
      <UserInformation />
      <DangerSettings />
    </div>
  );
}
