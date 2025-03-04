import { Dismiss, useDismissStore } from '@stores/dismissStore.ts';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { ReactNode } from 'react';
import { Button } from '@components/ui/button.tsx';

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
    <Button
      className={'cursor-pointer bg-transparent border-primary'}
      onClick={dismissHandler}
      variant={'outline'}>
      <XMarkIcon />
      Dismiss
    </Button>
  );
}
