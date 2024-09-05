import { motion } from 'framer-motion';
import { getShareUrl } from '@lib/share/url.ts';
import QrCodeModal from '@pages/explorer/components/QrCodeModal.tsx';
import {
  ArrowUpOnSquareIcon,
  ClipboardDocumentIcon,
  FingerPrintIcon,
} from '@heroicons/react/24/outline';
import { Copy } from '@pages/explorer/components/share/copy.tsx';
import { useNotifications } from '@stores/notificationStore.ts';

export function QuickShareResult({
  uuid,
  onReset,
}: {
  uuid: string;
  onReset: () => void;
}) {
  const notifications = useNotifications(s => s.actions);
  const shareData = {
    url: getShareUrl('folder', uuid),
    title: "Kosmos' quick share link",
  };
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={'grid place-items-center pt-5'}>
      <div
        className={
          'w-full max-w-xl rounded-xl bg-stone-300/20 p-5 outline outline-1 outline-stone-600/50'
        }>
        <h2 className={'text-3xl font-normal'}>Quick Share created!</h2>
        <span
          className={'mt-1 flex items-center gap-1 text-xs text-stone-600/50'}>
          <FingerPrintIcon className={'h-4 w-4'} /> {uuid}
        </span>
        <div
          className={'mt-5 flex flex-wrap items-center justify-center gap-3'}>
          <QrCodeModal button value={shareData.url}>
            QR Code
          </QrCodeModal>

          {navigator.share !== undefined && navigator.canShare(shareData) && (
            <button
              onClick={() => navigator.share(shareData)}
              className={'btn-white'}>
              <ArrowUpOnSquareIcon className={'h-5 w-5'} /> Share
            </button>
          )}
          <Copy text={shareData.url} notify={notifications.notify} chip={false}>
            <ClipboardDocumentIcon className={'h-5 w-5'} /> Copy Link
          </Copy>
        </div>
      </div>
      <div className={'mt-4'}>
        <button onClick={onReset} className={'text-stone-600 underline'}>
          Create another share
        </button>
      </div>
    </motion.div>
  );
}
