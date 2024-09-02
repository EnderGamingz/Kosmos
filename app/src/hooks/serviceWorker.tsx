import { registerSW } from 'virtual:pwa-register';
import { Severity, useNotifications } from '@stores/notificationStore.ts';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import tw from '@utils/classMerge.ts';

export function useServiceWorker() {
  const notifications = useNotifications(s => s.actions);

  // noinspection JSUnusedGlobalSymbols
  const updateSW = registerSW({
    onOfflineReady: () => {
      notifications.notify({
        severity: Severity.SUCCESS,
        title: 'Kosmos',
        timeout: 1500,
        status: 'Installed',
        canDismiss: true,
      });
    },
    onNeedRefresh: () => {
      const updateId = notifications.notify({
        severity: Severity.INFO,
        title: 'Kosmos',
        status: 'Update available',
        canDismiss: false,
        child: (
          <button
            onClick={() => {
              notifications.updateNotification(updateId, {
                loading: true,
                status: 'Updating',
              });
              updateSW().then(() => {
                notifications.updateNotification(updateId, {
                  severity: Severity.SUCCESS,
                  description: 'The app will reload shortly',
                  status: 'Updated',
                });
              });
            }}
            className={tw(
              'my-1 flex w-full items-center gap-4 rounded-lg px-4 py-1 shadow-md',
              'bg-stone-900 text-stone-50 transition-colors hover:bg-stone-600 hover:text-stone-100',
              'outline outline-1 outline-stone-400/20',
            )}>
            <ArrowPathIcon className={'h-4 w-4'} />
            Update now
          </button>
        ),
      });
    },
  });
}
