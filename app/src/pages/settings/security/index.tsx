import { PasswordChange } from '@pages/settings/security/passwordChange.tsx';

export default function SecuritySettings() {
  return (
    <div className={'space-y-3'}>
      <h1 className={'text-3xl font-bold'}>Security Settings</h1>
      <PasswordChange />
    </div>
  );
}
