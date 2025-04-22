import { useSharedItems } from '@lib/query.ts';
import ExplorerDataDisplay from '@pages/explorer/displayAlternatives/explorerDisplay.tsx';
import { motion } from 'framer-motion';
import { useEffect } from 'react';
import { useExplorerStore } from '@stores/explorerStore.ts';
import { ShareOperationType } from '@models/file.ts';
import ItemIcon from '@pages/explorer/components/ItemIcon.tsx';
import {
  containerVariant,
  itemTransitionVariant,
} from '@components/defaults/transition.ts';
import {
  Link,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import { getShareUrl } from '@lib/share/url.ts';
import EmptyList from '@pages/explorer/components/EmptyList.tsx';
import SubPageTitle from '@pages/explorer/components/subPageTitle.tsx';
import { SharedItems as SharedItemsDTO } from '@bindings/SharedItems.ts';
import { FileModelDTO } from '@bindings/FileModelDTO.ts';
import { FileModelWithShareInfoDTO } from '@bindings/FileModelWithShareInfoDTO.ts';
import { FolderModelWithShareInfoDTO } from '@bindings/FolderModelWithShareInfoDTO.ts';
import { AlbumModelWithShareInfoDTO } from '@bindings/AlbumModelWithShareInfoDTO.ts';
import { FolderModelDTO } from '@bindings/FolderModelDTO.ts';
import { SharedAlbumModelDTO } from '@bindings/SharedAlbumModelDTO.ts';
import { cn } from '@lib/utils.ts';
import { Progress } from '@/components/ui/progress';
import { PageMetadata } from '@components/metadata.tsx';
import { SquareArrowOutUpRight } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@components/ui/tabs.tsx';

export default function ExplorerSharePage() {
  const { pathname } = useLocation();

  const active = pathname.split('/').pop() || '';

  return (
    <div className={'flex flex-col p-5 grow'}>
      <div className={'mx-auto pb-4'}>
        <Tabs value={active} className={'max-w-md w-full mx-auto'}>
          <TabsList className={'w-full [&>*]:grow [&>*]:text-center flex-wrap'}>
            <Link to={'/home/share/shared'}>
              <TabsTrigger value={'shared'}>Shared Items</TabsTrigger>
            </Link>
            <Link to={'/home/share/shares'}>
              <TabsTrigger value={'shares'}>Shared with me</TabsTrigger>
            </Link>
          </TabsList>
        </Tabs>
      </div>
      <Routes>
        <Route path={'shared'} element={<SharedItems itemsForUser={false} />} />
        <Route path={'shares'} element={<SharedItems itemsForUser={true} />} />
      </Routes>
    </div>
  );
}

function SharedItems({ itemsForUser }: { itemsForUser: boolean }) {
  const items = useSharedItems(itemsForUser);
  const setFilesInScope = useExplorerStore(s => s.current.setFilesInScope);

  useEffect(
    () =>
      setFilesInScope(
        ((items.data as SharedItemsDTO)?.files as FileModelDTO[]) || [],
      ),
    [items, setFilesInScope],
  );

  const sharingType = itemsForUser ? 'with me' : 'by me';
  return (
    <div className={'relative grow flex flex-col'}>
      <PageMetadata title={`Shared ${sharingType}`} />
      <div className={'file-list relative flex flex-col overflow-y-auto grow'}>
        <Progress
          aria-label={'Shared items loading...'}
          indeterminate={!items?.data || items.isLoading}
          value={100}
          className={'absolute left-0 top-0 h-1 opacity-50'}
          color={'default'}
        />
        <div className={'px-2 pt-5'}>
          <SubPageTitle>{'Shared Items ' + sharingType}</SubPageTitle>
        </div>
        <div
          className={
            'flex flex-col relative grow max-h-[calc(100dvh-90px-2.5rem-52px-56px)] max-md:max-h-[calc(100dvh-90px-2.5rem-52px-56px-80px)]'
          }>
          {itemsForUser ? (
            <SharedForMe shares={items.data} />
          ) : (
            <ExplorerDataDisplay
              isLoading={items.isLoading}
              files={(items.data?.files as FileModelDTO[]) || []}
              folders={(items.data?.folders as FolderModelDTO[]) || []}
              viewSettings={{ limitedView: true }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function SharedForMe({ shares }: { shares?: SharedItemsDTO }) {
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
  share:
    | FileModelWithShareInfoDTO
    | FolderModelWithShareInfoDTO
    | AlbumModelWithShareInfoDTO;
  type: ShareOperationType;
}) {
  const navigate = useNavigate();
  const isFile = type === 'file';
  const isAlbum = type === 'album';

  const handleClick = () => {
    navigate(getShareUrl(type, share.share_uuid || '', true));
  };

  const itemName = isFile
    ? (share as FileModelDTO).file_name
    : isAlbum
      ? (share as SharedAlbumModelDTO).name
      : (share as FolderModelDTO).folder_name;

  return (
    <motion.li
      className={cn(
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
              ? (share as FileModelDTO).file_type
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
        <SquareArrowOutUpRight className={'h-4 w-4'} />
      </div>
    </motion.li>
  );
}
