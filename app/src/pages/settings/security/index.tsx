import { PasswordChange } from '@pages/settings/security/passwordChange.tsx';
import PasskeyList from '@pages/settings/security/passkeyList.tsx';
import { SettingsPageMetadata } from '@components/metadata.tsx';
import { SettingsTitle } from '@pages/settings';

export default function SecuritySettings() {
  return (
    <div className={'space-y-3'}>
      <SettingsTitle title={'Security'} />
      <SettingsPageMetadata title={'Security'} />
      <PasswordChange />
      <PasskeyList />
    </div>
  );
}
