import { PasswordChange } from '@pages/settings/security/passwordChange.tsx';
import PasskeyList from '@pages/settings/security/passkeyList.tsx';

export default function SecuritySettings() {
  return (
    <div className={'space-y-3'}>
      <h1 className={'text-3xl font-bold'}>Security Settings</h1>
      <PasswordChange />
      <PasskeyList />
    </div>
  );
}
