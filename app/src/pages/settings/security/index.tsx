import { PasswordChange } from '@pages/settings/security/passwordChange.tsx';
import PasskeyList from '@pages/settings/security/passkeyList.tsx';
import { SettingsPageMetadata } from '@components/metadata.tsx';
import { SettingsTitle } from '@pages/settings';

export default function SecuritySettings() {
  return (
    <div className={'space-y-3'}>
      <SettingsTitle title={'Security'} />
      <SettingsPageMetadata title={'Security'} />
      <div className={'grid grid-cols-1 gap-4 sm:grid-cols-2'}>
        <PasswordChange />
        <PasskeyList />
      </div>
    </div>
  );
}
