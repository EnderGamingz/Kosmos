import { AnimatePresence } from 'framer-motion';
import { NotificationItem } from './notificationItem';
import { useNotifications } from '@stores/notificationStore';
import tw from '@lib/classMerge.ts';
import { useEffect, useState } from 'react';

export default function NotificationIndicator() {
  const [expanded, setExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const notifications = useNotifications(s =>
    s.notifications.filter(x => x.popup),
  );

  useEffect(() => {
    if (window.innerWidth < 768) {
      setIsMobile(true);
    }
  }, []);

  return (
    <div
      className={
        'fixed right-10 z-[100] w-full max-w-[20rem] max-sm:left-5 max-sm:top-5 sm:bottom-10'
      }>
      <ul
        onClick={() => {
          if (notifications.length > 1) {
            setExpanded(!expanded);
          } else {
            setExpanded(false);
          }
        }}
        onMouseLeave={() => setExpanded(false)}
        className={tw(
          'group relative isolate',
          'flex max-h-64 flex-col-reverse gap-2 max-sm:flex-col',
          'bottom-0 [&_li]:absolute',
        )}>
        <AnimatePresence>
          {notifications.slice(0, 5).map((notification, i) => (
            <NotificationItem
              index={i}
              key={notification.id}
              data={notification}
              expanded={expanded}
              mobile={isMobile}
            />
          ))}
        </AnimatePresence>
      </ul>
    </div>
  );
}
