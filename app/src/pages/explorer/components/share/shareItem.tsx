import { getShareTypeString, ShareModel } from '@models/share.ts';
import { motion } from 'framer-motion';
import { itemTransitionVariantFadeInFromTop } from '@components/transition.ts';
import tw from '@lib/classMerge.ts';
import { Tooltip } from '@nextui-org/react';
import { useNotifications } from '@stores/notificationStore.ts';
import { DataOperationType } from '@models/file.ts';
import { formatDistanceToNow } from 'date-fns';
import { ChangePassword } from '@pages/explorer/components/share/password/changePassword.tsx';
import { Chip } from '@pages/explorer/components/share/chip.tsx';
import { Copy } from '@pages/explorer/components/share/copy.tsx';
import { DeleteShare } from '@pages/explorer/components/share/deleteShare.tsx';
import { getShareTypeIcon } from '@pages/explorer/components/share/getShareTypeIcon.tsx';
import { getShareUrl } from '@lib/share/url.ts';

function ShareItemIndicator({ active }: { active: boolean }) {
  return (
    <Tooltip content={active ? 'Active' : 'Expired'}>
      <div
        className={tw(
          'hidden h-3 min-h-3 w-3 min-w-3 rounded-full shadow transition-colors sm:block',
          active
            ? 'bg-green-300 shadow-green-300'
            : 'bg-red-300 shadow-red-300',
        )}
      />
    </Tooltip>
  );
}

export function ShareItem({
  share,
  type,
}: {
  share: ShareModel;
  type: DataOperationType;
}) {
  const notifications = useNotifications(s => s.actions);

  const isExpired = share.expires_at
    ? new Date() > new Date(share.expires_at)
    : false;
  const usageLeft =
    share.access_limit !== null ? share.access_limit! > 0 : true;

  const isActive = !isExpired && usageLeft;

  return (
    <motion.li
      layout
      variants={itemTransitionVariantFadeInFromTop}
      className={tw(
        'relative gap-2 rounded-lg bg-stone-300/30 px-3 py-2 sm:flex sm:flex-row sm:items-center',
        'outline outline-1 sm:bg-stone-300/30 sm:outline-transparent',
        isActive
          ? 'bg-green-300/5 outline-green-300'
          : 'bg-red-300/5 outline-red-300',
      )}>
      <ShareItemIndicator active={isActive} />
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
            <Chip content={`${share.access_limit} uses left`} />
          )}
          {share.expires_at && !isExpired && (
            <Chip
              content={
                <Tooltip content={new Date(share.expires_at).toLocaleString()}>
                  <p>{formatDistanceToNow(share.expires_at)} left</p>
                </Tooltip>
              }
            />
          )}
          {share.password && <ChangePassword id={share.id} />}
        </div>
      </div>
      <div
        className={
          'ml-auto mt-2 flex justify-center gap-1 sm:mt-0 sm:flex-col sm:items-end'
        }>
        <div className={'mr-auto sm:mr-[unset]'}>
          <DeleteShare id={share.id} />
        </div>
        <div className={'flex items-center gap-1 text-xs text-stone-500/90'}>
          {share.share_target_username ? (
            <Tooltip content={share.share_target_username}>
              <p className={'max-w-[100px] truncate'}>
                @{share.share_target_username}
              </p>
            </Tooltip>
          ) : (
            'Public'
          )}
          {getShareTypeIcon(share.share_type)}
        </div>
        {isActive && (
          <Copy
            text={getShareUrl(type, share.uuid)}
            notify={notifications.notify}
          />
        )}
      </div>
    </motion.li>
  );
}
