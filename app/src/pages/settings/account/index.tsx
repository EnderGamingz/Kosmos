import { DangerSettings } from '@pages/settings/account/dangerSettings.tsx';
import { UserInformation } from '@pages/settings/account/userInformation.tsx';
import { Helmet } from 'react-helmet';

export default function AccountSettings() {
  return (
    <div className={'space-y-3'}>
      <h1 className={'text-3xl font-bold'}>Account Settings</h1>
      <Helmet>
        <title>Account</title>
      </Helmet>
      <UserInformation />
      <DangerSettings />
    </div>
  );
}
