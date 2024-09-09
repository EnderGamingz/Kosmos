import { useSharedItems } from '@lib/query.ts';
import ExplorerDataDisplay from '@pages/explorer/displayAlternatives/explorerDisplay.tsx';
import { Progress } from '@nextui-org/react';
import { motion } from 'framer-motion';
import { useEffect } from 'react';
import { useExplorerStore } from '@stores/explorerStore.ts';
import { SharedItemsResponse } from '@models/share.ts';
import { FileModel, ShareFileModel, ShareOperationType } from '@models/file.ts';
import ItemIcon from '@pages/explorer/components/ItemIcon.tsx';
import { FolderModel, ShareFolderModel } from '@models/folder.ts';
import {
  containerVariant,
  itemTransitionVariant,
} from '@components/defaults/transition.ts';
import { useNavigate } from 'react-router-dom';
import { getShareUrl } from '@lib/share/url.ts';
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';
import EmptyList from '@pages/explorer/components/EmptyList.tsx';
import { ShareAlbumModel } from '@models/album.ts';
import { Helmet } from 'react-helmet';
import SubPageTitle from '@pages/explorer/components/subPageTitle.tsx';
import tw from '@utils/classMerge.ts';

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
      <Helmet>
        <title>{itemsForUser ? 'Shared with me' : 'Shared by me'}</title>
      </Helmet>
      <div
        className={
          'file-list relative flex h-full max-h-[calc(100dvh-90px)] flex-col overflow-y-auto max-md:max-h-[calc(100dvh-90px-80px)]'
        }>
        <Progress
          aria-label={'Recent Files loading...'}
          isIndeterminate={!items?.data || items.isLoading}
          value={100}
          className={'absolute left-0 top-0 h-1 opacity-50'}
          color={'default'}
        />
        <div className={'px-5 pt-5'}>
          <SubPageTitle>
            Shared Items {itemsForUser ? 'with me' : 'by me'}
          </SubPageTitle>
        </div>
        {itemsForUser ? (
          <SharedForMe shares={items.data} />
        ) : (
          <ExplorerDataDisplay
            isLoading={items.isLoading}
            files={items.data?.files || []}
            folders={items.data?.folders || []}
            viewSettings={{ limitedView: true }}
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
      {shares?.albums.map(share => (
        <ShareForMeItem key={share.id} share={share} type={'album'} />
      ))}
      {!shares?.files.length &&
        !shares?.folders.length &&
        !shares?.albums.length && <EmptyList />}
    </motion.ul>
  );
}

function ShareForMeItem({
  share,
  type,
}: {
  share: ShareFileModel | ShareFolderModel | ShareAlbumModel;
  type: ShareOperationType;
}) {
  const navigate = useNavigate();
  const isFile = type === 'file';
  const isAlbum = type === 'album';

  const handleClick = () => {
    navigate(getShareUrl(type, share.share_uuid || '', true));
  };

  const itemName = isFile
    ? (share as FileModel).file_name
    : isAlbum
      ? (share as ShareAlbumModel).name
      : (share as FolderModel).folder_name;

  return (
    <motion.li
      className={tw(
        'grid cursor-pointer items-center rounded-xl bg-stone-300/30 p-1 pr-3 transition-colors hover:bg-stone-400/50 sm:flex sm:gap-2',
        'dark:bg-stone-700/30 dark:hover:bg-stone-700/60',
      )}
      onClick={handleClick}
      variants={itemTransitionVariant}>
      <div className={'flex items-center gap-2'}>
        <ItemIcon
          id={share.id}
          type={
            isFile
              ? (share as FileModel).file_type
              : isAlbum
                ? 'album'
                : 'folder'
          }
          disablePreview
          name={itemName}
        />
        <div
          className={'flex w-full text-stone-700 sm:grid dark:text-stone-300'}>
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
