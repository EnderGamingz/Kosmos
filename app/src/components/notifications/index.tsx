import { AnimatePresence } from 'framer-motion';
import { NotificationItem } from './notificationItem';
import { useNotifications } from '@stores/notificationStore';
import { useEffect, useState } from 'react';
import { cn } from '@lib/utils.ts';
import { useLocation } from 'react-router-dom';

export default function NotificationIndicator() {
  const [expanded, setExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const notifications = useNotifications(s => s.notifications);
  const location = useLocation();

  const filteredNotifications = notifications
    .filter(x => x.popup)
    .sort((a, b) => (b.priority || 0) - (a.priority || 0));

  useEffect(() => {
    if (window.innerWidth < 768) setIsMobile(true);
  }, []);

  // Close notifications on updates
  useEffect(() => {
    setExpanded(false);
  }, [location.pathname, notifications.length, isMobile]);

  const maxNotificationsToShow = 8;
  return (
    <div
      className={
        'fixed right-10 z-[100] w-full max-w-[20rem] max-sm:left-5 max-sm:top-5 sm:bottom-10'
      }>
      <ul
        onClick={() => {
          if (filteredNotifications.length > 1) setExpanded(!expanded);
          else setExpanded(false);
        }}
        className={cn(
          'group relative isolate',
          'flex max-h-64 flex-col-reverse gap-2 max-sm:flex-col',
          'bottom-0 [&_li]:absolute',
        )}>
        <AnimatePresence>
          {filteredNotifications
            .slice(0, maxNotificationsToShow)
            .map((notification, i) => (
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
