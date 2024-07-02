import {
  CreateNotificationPayload,
  Severity,
} from '@stores/notificationStore.ts';

export function Copy({
  notify,
  text,
}: {
  notify: (data: CreateNotificationPayload) => void;
  text: string;
}) {
  return (
    <button
      onClick={() =>
        navigator.clipboard.writeText(text).then(() => {
          notify({
            title: 'Copy',
            description: 'Share link copied',
            status: 'Success',
            severity: Severity.SUCCESS,
            canDismiss: true,
            timeout: 1000,
          });
        })
      }
      className={
        'rounded-full bg-stone-500/20 px-2 py-0.5 text-xs transition-colors hover:bg-stone-500/50'
      }>
      Copy Link
    </button>
  );
}
