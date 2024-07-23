import { Dismiss, useDismissStore } from '@stores/dismissStore.ts';
import { SYSTEM_MESSAGE } from '@lib/env.ts';
import { DismissButton } from '@pages/explorer/components/dismissButton.tsx';
import { XMarkIcon } from '@heroicons/react/24/outline';
import tw from '@utils/classMerge.ts';

export default function SystemMessage() {
  const isDismissed = useDismissStore(s =>
    s.isDismissed(Dismiss.SystemMessage),
  );

  if (isDismissed || !SYSTEM_MESSAGE) return null;

  return (
    <div
      className={tw(
        'fixed bottom-1 z-50 mx-1 flex items-center gap-2 rounded-lg bg-stone-600 px-4 py-2 text-sm text-stone-50',
        'md:bottom-[unset] md:right-1/2 md:top-1 md:translate-x-1/2',
      )}>
      {SYSTEM_MESSAGE}
      <DismissButton id={Dismiss.SystemMessage}>
        <XMarkIcon className={'h-5 w-5'} />
      </DismissButton>
    </div>
  );
}
