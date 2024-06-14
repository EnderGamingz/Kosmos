import { useCallback, useEffect, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';

export function UpdatingTimeIndicator({
  time,
}: {
  time: string | number | Date;
}) {
  const getTime = useCallback(() => {
    return formatDistanceToNow(time, {
      addSuffix: true,
    });
  }, [time]);

  const [display, setDisplay] = useState(getTime);

  useEffect(() => {
    const interval = setInterval(() => {
      setDisplay(getTime());
    }, 60_000);

    return () => clearInterval(interval);
  }, [getTime]);

  return display;
}
