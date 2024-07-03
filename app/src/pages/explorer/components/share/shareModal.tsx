import { useExplorerStore } from '@stores/explorerStore.ts';
import { AnimatePresence, motion } from 'framer-motion';
import { DataOperationType } from '@models/file.ts';
import { useState } from 'react';
import { useUserShareData } from '@lib/query.ts';
import { Backdrop } from '@components/backdrop.tsx';
import tw from '@lib/classMerge.ts';
import { ShareData } from '@pages/explorer/components/share/shareData.tsx';
import { ShareIcon } from '@heroicons/react/24/outline';
import { ScrollShadow } from '@nextui-org/react';
import { ModalCloseButton } from '@pages/explorer/file/display/modalCloseButton.tsx';
import { CreateShare } from '@pages/explorer/components/share/create/createShare.tsx';

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
              'flex flex-col overflow-hidden text-stone-800',
            )}>
            <div className={'flex items-center justify-between'}>
              <h2 className={'text-2xl font-semibold'}>
                Share {shareElementType}{' '}
                <span className={'align-top text-sm font-light'}>
                  ({data.data?.length ?? '?'})
                </span>
              </h2>
              <button
                onClick={() => setCreate(prev => !prev)}
                className={'flex items-center gap-2 font-bold'}>
                <ShareIcon className={'h-4 w-4 fill-stone-800'} />
                {create ? 'Cancel' : 'Create'}
              </button>
            </div>
            <ScrollShadow
              className={
                'mb-3 flex h-full flex-col overflow-y-auto px-1 py-5 scrollbar-hide'
              }>
              <AnimatePresence>
                {create ? (
                  <CreateShare
                    onDone={() => setCreate(false)}
                    dataType={shareElementType}
                    id={shareElementId}
                  />
                ) : (
                  <ShareData
                    shares={data.data}
                    type={shareElementType}
                    loading={data.isLoading}
                  />
                )}
              </AnimatePresence>
            </ScrollShadow>
            <ModalCloseButton onClick={onClose} />
          </motion.div>
        </div>
      </div>
    </>
  );
}
