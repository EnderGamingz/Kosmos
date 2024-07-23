import { Dismiss, useDismissStore } from '@stores/dismissStore.ts';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { ReactNode } from 'react';

export function DismissButton({
  id,
  children,
}: {
  id: Dismiss;
  children?: ReactNode;
}) {
  const dismiss = useDismissStore(s => s.actions.dismiss);

  const dismissHandler = () => dismiss(id);

  if (children) return <button onClick={dismissHandler}>{children}</button>;

  return (
    <button onClick={dismissHandler} className={'btn-white'}>
      <XMarkIcon />
      Dismiss
    </button>
  );
}
