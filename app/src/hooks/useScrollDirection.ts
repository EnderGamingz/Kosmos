import { RefObject, useEffect, useState } from 'react';

export function useScrollThreshold(
  ref: RefObject<HTMLElement | null>,
  threshold: number,
) {
  const [isScrolled, setIsScrolled] = useState<boolean>(false);

  useEffect(() => {
    const current = ref.current;
    if (!current) return;
    const checkScrollDistance = () => {
      const scrollTop = current!.scrollTop;
      if (scrollTop > threshold) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    current.addEventListener('scroll', checkScrollDistance);
    return () => {
      current?.removeEventListener('scroll', checkScrollDistance);
    };
  }, [ref, threshold]);

  return isScrolled;
}
