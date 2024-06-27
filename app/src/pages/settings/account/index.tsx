import { DangerSettings } from '@pages/settings/account/dangerSettings.tsx';

export default function AccountSettings() {
  return (
    <div className={'space-y-3'}>
      <h1 className={'text-3xl font-bold'}>Account Settings</h1>
      <DangerSettings />
    </div>
  );
}
