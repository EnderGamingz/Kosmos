import { useKeyStore } from '@stores/keyStore.ts';
import { useEffect } from 'react';

export function useInitializeKeys() {
  const updateKeys = useKeyStore(s => s.actions);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Shift') updateKeys.toggleShift(true);
      if (e.key === 'Control') updateKeys.toggleCtrl(true);
    };

    const handleKeyUpAndFocus = (e: KeyboardEvent | FocusEvent) => {
      // As browsers don't send KeyboardEvents when a tab is inactive, always assume
      // that the Shift and Control keys are unpressed when the window regains focus,
      // to prevent the key status from becoming "stuck" on true.
      if (
        e instanceof KeyboardEvent &&
        e.key !== 'Shift' &&
        e.key !== 'Control'
      )
        return;

      updateKeys.toggleShift(false);
      updateKeys.toggleCtrl(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUpAndFocus);
    window.addEventListener('focus', handleKeyUpAndFocus);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUpAndFocus);
      window.removeEventListener('focus', handleKeyUpAndFocus);
    };
  }, [updateKeys]);

  useEffect(() => {
    window.addEventListener('contextmenu', e => e.preventDefault());
  }, []);
}
