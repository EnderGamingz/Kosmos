import { Dismiss, useDismissStore } from '@stores/dismissStore.ts';
import { ReactNode } from 'react';
import { Button } from '@components/ui/button.tsx';
import { X } from 'lucide-react';

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
      className={'bg-transparent border-primary'}
      onClick={dismissHandler}
      variant={'outline'}>
      <X />
      Dismiss
    </Button>
  );
}
