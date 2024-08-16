import { registerSW } from 'virtual:pwa-register';
import { Severity, useNotifications } from '@stores/notificationStore.ts';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

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
                  loading: false,
                  status: 'Updated',
                  canDismiss: true,
                  timeout: 2000,
                });
              });
            }}
            className={
              'menu-button mt-2 w-full bg-stone-200 py-0.5 hover:bg-stone-500 hover:text-stone-100'
            }>
            <ArrowPathIcon className={'h-4 w-4'} />
            Update now
          </button>
        ),
      });
    },
  });
}
