import { useNotifications } from '../../stores/notificationStore';
import { AnimatePresence } from 'framer-motion';
import { NotificationItem } from './notificationItem.tsx';

export default function NotificationIndicator() {
  const notifications = useNotifications(s =>
    s.notifications.filter(x => x.popup),
  );

  return (
    <div
      className={
        'fixed right-10 z-[100] w-full max-w-[20rem] max-sm:left-5 max-sm:top-5 sm:bottom-10'
      }>
      <ul
        className={
          'flex max-h-64 flex-col-reverse gap-2 overflow-hidden max-sm:flex-col'
        }>
        <AnimatePresence>
          {notifications.slice(0, 5).map(notification => (
            <NotificationItem key={notification.id} data={notification} />
          ))}
        </AnimatePresence>
      </ul>
    </div>
  );
}
