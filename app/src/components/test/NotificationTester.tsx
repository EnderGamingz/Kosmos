import { Severity, useNotifications } from '@stores/notificationStore.ts';
import { Button } from '@components/ui/button.tsx';

export default function NotificationTester() {
  const { actions } = useNotifications();
  const notify = actions.notify;

  return (
    <div className={'fixed bottom-0 right-0 bg-popover border flex gap-2 p-2'}>
      <Button onClick={() => actions.clearNotifications()}>Clear</Button>
      <Button
        onClick={() =>
          notify({
            severity: Severity.SUCCESS,
            title: 'Success',
            description: 'This is a success notification',
            status: 'Done',
          })
        }>
        Success
      </Button>
      <Button
        onClick={() => notify({ severity: Severity.INFO, title: 'Info' })}>
        Info
      </Button>
      <Button
        onClick={() =>
          notify({
            severity: Severity.ERROR,
            title: 'Error',
            description: 'This is an error notification',
            status: 'Failed',
          })
        }>
        Error
      </Button>
    </div>
  );
}
