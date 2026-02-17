import { getShareTypeString } from '@models/share.ts';
import { motion } from 'framer-motion';
import { useNotifications } from '@stores/notificationStore.ts';
import type { ShareOperationType } from '@models/file.ts';
import { formatDistanceToNow } from 'date-fns';
import { ChangePassword } from '@pages/explorer/components/share/password/changePassword.tsx';
import { Chip } from '@pages/explorer/components/share/chip.tsx';
import { Copy } from '@pages/explorer/components/share/copy.tsx';
import { DeleteShare } from '@pages/explorer/components/share/deleteShare.tsx';
import { getShareTypeIcon } from '@pages/explorer/components/share/getShareTypeIcon.tsx';
import { getShareUrl } from '@lib/share/url.ts';
import QrCodeModal from '@pages/explorer/components/QrCodeModal.tsx';
import type { ExtendedShareModelDTO } from '@bindings/ExtendedShareModelDTO.ts';
import { cn } from '@lib/utils.ts';
import { Share } from 'lucide-react';

export function ShareItem({
  share,
  type,
  index,
}: {
  share: ExtendedShareModelDTO;
  type: ShareOperationType;
  index: number;
}) {
  const notifications = useNotifications(s => s.actions);

  const isExpired = share.expires_at
    ? new Date() > new Date(share.expires_at)
    : false;
  const usageLeft =
    share.access_limit !== null ? share.access_limit! > 0 : true;

  const isActive = !isExpired && usageLeft;

  const shareData = {
    url: getShareUrl(type, share.uuid),
    title: "Kosmos' share link",
  };

  return (
    <motion.li
      layout
      className={cn(
        'relative gap-2 rounded-md px-3 py-2 shadow-sm',
        'border-l-3 animate-fade-in-top bg-gradient-to-br from-popover to-primary/5',
        isActive ? 'border-l-green-300' : 'border-l-red-300',
      )}
      style={{
        animationDelay: `${index * 50}ms`,
      }}
    >
      <div>
        <p className={'font-medium'}>
          {getShareTypeString(share.share_type)}ly shared
          <span className={'ml-1 text-xs font-light text-stone-600/95'}>
            {formatDistanceToNow(share.created_at, { addSuffix: true })}
          </span>
        </p>

        <div className={'mt-1 flex flex-wrap items-center gap-2'}>
          <Chip
            content={
              share.access_count
                ? `Used ${share.access_count} time${share.access_count > 1 ? 's' : ''}`
                : 'Never used'
            }
          />
          {share.access_limit !== null && (
            <Chip
              content={`${share.access_limit} use${share.access_limit > 1 ? 's' : ''} left`}
            />
          )}
          {share.expires_at && !isExpired && (
            <Chip
              content={
                <p title={new Date(share.expires_at).toLocaleString()}>
                  {formatDistanceToNow(share.expires_at)} left
                </p>
              }
            />
          )}
          {share.password && <ChangePassword id={share.id} />}
        </div>
      </div>
      <div className={'ml-auto mt-2 flex justify-center gap-1'}>
        <div className={'mr-auto flex items-center gap-2'}>
          <DeleteShare id={share.id} />
          <div
            className={'flex items-center gap-1 text-xs text-muted-foreground'}
          >
            {share.share_target_username ? (
              <p
                title={share.share_target_username}
                className={'max-w-[100px] truncate'}
              >
                @{share.share_target_username}
              </p>
            ) : (
              'Public'
            )}
            {getShareTypeIcon(share.share_type)}
          </div>
        </div>
        <div className={'flex items-center gap-2'}>
          {isActive && (
            <>
              <QrCodeModal value={shareData.url} />
              {navigator.share !== undefined &&
                navigator.canShare(shareData) && (
                  <button onClick={() => navigator.share(shareData)}>
                    <Share className={'h-5 w-5'} />
                  </button>
                )}
              <Copy text={shareData.url} notify={notifications.notify} />
            </>
          )}
        </div>
      </div>
    </motion.li>
  );
}
