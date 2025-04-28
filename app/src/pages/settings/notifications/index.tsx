import { SettingsPageMetadata } from '@components/metadata.tsx';
import { SettingsTitle } from '@pages/settings';
import { DismissedSystemMessages } from '@pages/settings/notifications/dismissedSystemMessages.tsx';
import { RegisteredPushSubscriptions } from '@pages/settings/notifications/registeredPushSubscriptions.tsx';

export default function NotificationsSettingsPage() {
  return (
    <div className={'space-y-3'}>
      <SettingsTitle title={'Notifications'} />
      <SettingsPageMetadata title={'Notifications'} />
      <RegisteredPushSubscriptions />
      <DismissedSystemMessages />
    </div>
  );
}
