import { useExplorerStore } from '@stores/explorerStore.ts';
import { AnimatePresence, motion } from 'framer-motion';
import { DataOperationType } from '@models/file.ts';
import { useState } from 'react';
import { useUserShareData } from '@lib/query.ts';
import { Backdrop } from '@components/backdrop.tsx';
import tw from '@lib/classMerge.ts';
import { PlusIcon } from '@heroicons/react/24/solid';
import { ShareData } from '@pages/explorer/components/share/shareData.tsx';

export default function ShareModal() {
  const { shareElementId, shareElementType, clearShareElement } =
    useExplorerStore(s => s.share);
  const hasShare = !!shareElementId && !!shareElementType;

  return (
    <AnimatePresence>
      {hasShare && (
        <ShareModalContent
          shareElementId={shareElementId}
          shareElementType={shareElementType}
          onClose={clearShareElement}
        />
      )}
    </AnimatePresence>
  );
}

export function ShareModalContent({
  shareElementId,
  shareElementType,
  onClose,
}: {
  shareElementId: string;
  shareElementType: DataOperationType;
  onClose: () => void;
}) {
  const [create, setCreate] = useState(false);
  const data = useUserShareData(shareElementId, shareElementType);

  return (
    <>
      <Backdrop onClose={onClose} />
      <div
        className={tw(
          'pointer-events-none isolate flex h-full w-full items-center justify-end',
          'fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 p-3 md:p-5',
        )}>
        <div
          className={
            'pointer-events-auto isolate flex h-full w-full items-center sm:max-w-[500px]'
          }>
          <motion.div
            initial={{ opacity: 0, x: 80, scale: 0.9, height: '50%' }}
            animate={{ opacity: 1, x: 0, scale: 1, height: '100%' }}
            exit={{ opacity: 0, x: 80, scale: 0.9, height: '50%' }}
            transition={{ duration: 0.2 }}
            className={tw(
              'relative z-10 shadow-[-5px_0_10px_0_rgba(0,0,0,0.1)]',
              'w-full rounded-xl bg-gray-50 p-3 md:p-6',
              'overflow-hidden text-stone-800',
            )}>
            <div className={'flex items-center justify-between'}>
              <h2 className={'text-2xl font-semibold'}>
                Share {shareElementType}
              </h2>
              <button>
                <PlusIcon
                  className={'h-6 w-6'}
                  onClick={() => setCreate(prev => !prev)}
                />
              </button>
            </div>
            <div className={'flex flex-col justify-center px-1 py-5'}>
              <AnimatePresence>
                <ShareData
                  shares={data.data}
                  type={shareElementType}
                  loading={data.isLoading}
                />
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}
