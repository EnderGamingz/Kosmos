import { MutableRefObject, useEffect, useState } from 'react';

export function useScrollDirection(el: MutableRefObject<HTMLElement | null>) {
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down' | null>(
    null,
  );

  useEffect(() => {
    const current = el.current;
    if (!current) return;
    let lastScrollTop = current.scrollTop;
    const updateScrollDirection = () => {
      const scrollTop = current!.scrollTop;
      const direction = scrollTop > lastScrollTop ? 'down' : 'up';
      if (
        direction !== scrollDirection &&
        (scrollTop - lastScrollTop > 5 || scrollTop - lastScrollTop < -5)
      ) {
        setScrollDirection(direction);
      }
      lastScrollTop = scrollTop > 0 ? scrollTop : 0;
    };
    current.addEventListener('scroll', updateScrollDirection);
    return () => {
      current?.removeEventListener('scroll', updateScrollDirection);
    };
  }, [scrollDirection, el]);

  return scrollDirection;
}

export function useScrollThreshold(
  ref: MutableRefObject<HTMLElement | null>,
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
