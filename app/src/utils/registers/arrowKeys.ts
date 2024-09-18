import { useEffect } from 'react';

function arrows(
  top?: () => void,
  down?: () => void,
  left?: () => void,
  right?: () => void,
) {
  const onArrowUp = (e: KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      top?.();
    }
  };
  const onArrowDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      down?.();
    }
  };
  const onArrowLeft = (e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      left?.();
    }
  };
  const onArrowRight = (e: KeyboardEvent) => {
    if (e.key === 'ArrowRight') {
      right?.();
    }
  };
  return { onArrowUp, onArrowDown, onArrowLeft, onArrowRight };
}

export const useArrowKeys = ({
  left,
  right,
  top,
  down,
  deps = [],
}: {
  left?: () => void;
  right?: () => void;
  top?: () => void;
  down?: () => void;
  deps?: unknown[];
}) => {
  useEffect(() => {
    const { onArrowUp, onArrowDown, onArrowLeft, onArrowRight } = arrows(
      top,
      down,
      left,
      right,
    );

    document.addEventListener('keydown', onArrowUp);
    document.addEventListener('keydown', onArrowDown);
    document.addEventListener('keydown', onArrowLeft);
    document.addEventListener('keydown', onArrowRight);

    return () => {
      document.removeEventListener('keydown', onArrowUp);
      document.removeEventListener('keydown', onArrowDown);
      document.removeEventListener('keydown', onArrowLeft);
      document.removeEventListener('keydown', onArrowRight);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
};
