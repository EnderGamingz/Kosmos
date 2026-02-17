import { motion } from 'framer-motion';
import { getShareUrl } from '@lib/share/url.ts';
import QrCodeModal from '@pages/explorer/components/QrCodeModal.tsx';
import { Copy } from '@pages/explorer/components/share/copy.tsx';
import { useNotifications } from '@stores/notificationStore.ts';
import { Button } from '@/components/ui/button';
import { ClipboardCopy, Fingerprint, Share } from 'lucide-react';

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
      className={'grid place-items-center pt-5'}
    >
      <div className={'w-full max-w-xl rounded-xl p-5 border'}>
        <h2 className={'text-3xl font-normal'}>Quick Share created!</h2>
        <span
          className={
            'mt-1 flex items-center gap-1 text-xs text-muted-foreground'
          }
        >
          <Fingerprint className={'h-4 w-4'} /> {uuid}
        </span>
        <div
          className={'mt-5 flex flex-wrap items-center justify-center gap-3'}
        >
          <QrCodeModal button value={shareData.url}>
            QR Code
          </QrCodeModal>

          {navigator.share !== undefined && navigator.canShare(shareData) && (
            <Button
              onClick={() => navigator.share(shareData)}
              variant={'outline'}
              className={'border-primary bg-transparent'}
            >
              <Share className={'h-5 w-5'} /> Share
            </Button>
          )}
          <Copy text={shareData.url} notify={notifications.notify} chip={false}>
            <ClipboardCopy className={'h-5 w-5'} /> Copy Link
          </Copy>
        </div>
      </div>
      <div className={'mt-4'}>
        <button
          type={'button'}
          onClick={onReset}
          className={'text-stone-600 underline'}
        >
          Create another share
        </button>
      </div>
    </motion.div>
  );
}
