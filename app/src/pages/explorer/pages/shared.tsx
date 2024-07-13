import { useSharedItems } from '@lib/query.ts';
import ExplorerDataDisplay from '@pages/explorer/displayAlternatives/explorerDisplay.tsx';
import { Progress } from '@nextui-org/react';
import { SideNavToggle } from '@pages/explorer/components/sideNavToggle.tsx';
import { motion } from 'framer-motion';
import { useEffect } from 'react';
import { useExplorerStore } from '@stores/explorerStore.ts';
import { SharedItemsResponse } from '@models/share.ts';
import { DataOperationType, FileModel, ShareFileModel } from '@models/file.ts';
import ItemIcon from '@pages/explorer/components/ItemIcon.tsx';
import { FolderModel, ShareFolderModel } from '@models/folder.ts';
import {
  containerVariant,
  itemTransitionVariant,
} from '@components/transition.ts';
import { useNavigate } from 'react-router-dom';
import { getShareUrl } from '@lib/share/url.ts';
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';

export default function SharedItems({
  itemsForUser,
}: {
  itemsForUser: boolean;
}) {
  const items = useSharedItems(itemsForUser);
  const setFilesInScope = useExplorerStore(s => s.current.setFilesInScope);

  useEffect(() => {
    setFilesInScope((items.data as SharedItemsResponse)?.files || []);
  }, [items, setFilesInScope]);

  return (
    <div className={'relative h-full'}>
      <div
        className={
          'file-list relative flex h-full max-h-[calc(100dvh-90px)] flex-col overflow-y-auto'
        }>
        <Progress
          aria-label={'Recent Files loading...'}
          isIndeterminate={!items?.data || items.isLoading}
          value={100}
          className={'absolute left-0 top-0 h-1 opacity-50'}
          color={'default'}
        />
        <div className={'flex items-center gap-2 px-5 pt-5'}>
          <SideNavToggle />
          <motion.h1
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className={'text-3xl font-semibold text-stone-800'}>
            Shared Items {itemsForUser ? 'with me' : 'by me'}
          </motion.h1>
        </div>
        {itemsForUser ? (
          <SharedForMe shares={items.data} />
        ) : (
          <ExplorerDataDisplay
            isLoading={items.isLoading}
            files={items.data?.files || []}
            folders={items.data?.folders || []}
            limitedView
          />
        )}
      </div>
    </div>
  );
}

function SharedForMe({ shares }: { shares?: SharedItemsResponse }) {
  return (
    <motion.ul
      className={'space-y-2 p-5'}
      variants={containerVariant()}
      initial={'hidden'}
      animate={'show'}>
      {shares?.folders.map(share => (
        <ShareForMeItem key={share.id} share={share} type={'folder'} />
      ))}
      {shares?.files.map(share => (
        <ShareForMeItem key={share.id} share={share} type={'file'} />
      ))}
    </motion.ul>
  );
}

function ShareForMeItem({
  share,
  type,
}: {
  share: ShareFileModel | ShareFolderModel;
  type: DataOperationType;
}) {
  const navigate = useNavigate();
  const isFile = type === 'file';

  const handleClick = () => {
    navigate(getShareUrl(type, share.share_uuid || '', true));
  };

  const itemName = isFile
    ? (share as FileModel).file_name
    : (share as FolderModel).folder_name;
  return (
    <motion.li
      className={
        'grid cursor-pointer items-center rounded-xl bg-stone-300/30 p-1 pr-3 transition-colors hover:bg-stone-400/50 sm:flex sm:gap-2'
      }
      onClick={handleClick}
      variants={itemTransitionVariant}>
      <div className={'flex items-center gap-2'}>
        <ItemIcon
          id={share.id}
          type={isFile ? (share as FileModel).file_type : 'folder'}
          disablePreview
          name={itemName}
        />
        <div className={'flex w-full text-stone-700 sm:grid'}>
          <p className={'w-0 flex-grow truncate sm:w-full'}>{itemName}</p>
          <span className={'hidden text-xs text-stone-500 sm:flex'}>
            {share.share_uuid}
          </span>
        </div>
      </div>
      <div className={'ml-auto flex items-center gap-2'}>
        {share.share_target_username && (
          <p className={'text-xs text-stone-500'}>
            by @{share.share_target_username}
          </p>
        )}
        <ArrowTopRightOnSquareIcon className={'h-4 w-4'} />
      </div>
    </motion.li>
  );
}
