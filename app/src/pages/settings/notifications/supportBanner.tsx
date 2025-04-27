type BrowserFeature = 'serviceWorker' | 'push' | 'notification';

const FEATURE_ERROR_MESSAGES = {
  serviceWorker: 'Service Workers are not supported in your browser',
  push: 'Push notifications are not supported in your browser',
  notification: 'Notifications are not supported in your browser',
  notificationDenied: 'Notifications are blocked in your browser settings',
} as const;

const checkBrowserFeature = (feature: BrowserFeature): boolean => {
  const featureMap = {
    serviceWorker: 'serviceWorker' in navigator,
    push: 'PushManager' in window,
    notification: 'Notification' in window,
  };
  return featureMap[feature];
};

const isNotificationsDenied = async (): Promise<boolean> => {
  if (!('Notification' in window)) return false;
  const permission = await Notification.requestPermission();
  return permission === 'denied';
};

export const getError = async (): Promise<string | null> => {
  if (!checkBrowserFeature('serviceWorker'))
    return FEATURE_ERROR_MESSAGES.serviceWorker;
  if (!checkBrowserFeature('push')) return FEATURE_ERROR_MESSAGES.push;
  if (!checkBrowserFeature('notification'))
    return FEATURE_ERROR_MESSAGES.notification;
  if (await isNotificationsDenied())
    return FEATURE_ERROR_MESSAGES.notificationDenied;
  return null;
};

export function SupportBanner({ error }: { error: string | null }) {
  if (!error) return null;

  return (
    <div
      className={
        'rounded-sm border bg-red-200/40 text-red-800 p-3 dark:bg-red-800/40 dark:text-red-200'
      }>
      <p>{error}</p>
    </div>
  );
}
