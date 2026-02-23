import { useSharedItems } from '@lib/query.ts';
import ExplorerDataDisplay from '@pages/explorer/displayAlternatives/display/explorerDisplay.tsx';
import { motion } from 'framer-motion';
import { useEffect } from 'react';
import { useExplorerStore } from '@stores/explorerStore.ts';
import type { ShareOperationType } from '@models/file.ts';
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
import type { SharedItems as SharedItemsDTO } from '@bindings/SharedItems.ts';
import type { FileModelDTO } from '@bindings/FileModelDTO.ts';
import type { FileModelWithShareInfoDTO } from '@bindings/FileModelWithShareInfoDTO.ts';
import type { FolderModelWithShareInfoDTO } from '@bindings/FolderModelWithShareInfoDTO.ts';
import type { AlbumModelWithShareInfoDTO } from '@bindings/AlbumModelWithShareInfoDTO.ts';
import type { FolderModelDTO } from '@bindings/FolderModelDTO.ts';
import type { SharedAlbumModelDTO } from '@bindings/SharedAlbumModelDTO.ts';
import { cn } from '@lib/utils.ts';
import { PageMetadata } from '@components/metadata.tsx';
import { SquareArrowOutUpRight } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@components/ui/tabs.tsx';
import { RouterLoadingBar } from '@components/header/routerLoading.tsx';

export default function ExplorerSharePage() {
  const { pathname } = useLocation();
  const active = pathname.split('/').pop() || '';

  return (
    <div className={'flex flex-col pt-5 grow'}>
      <div className={'pb-4'}>
        <Tabs value={active} className={'max-w-sm w-full mx-auto'}>
          <TabsList
            className={
              'w-full *:grow *:text-center flex-wrap [&_button]:w-full'
            }
          >
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
        {(!items?.data || items.isLoading) && <RouterLoadingBar />}
        <div className={'flex flex-col relative grow'}>
          {itemsForUser ? (
            <SharedForMe shares={items.data} />
          ) : (
            <ExplorerDataDisplay
              isLoading={items.isLoading}
              files={(items.data?.files as FileModelDTO[]) || []}
              folders={(items.data?.folders as FolderModelDTO[]) || []}
              viewSettings={{
                limitedView: true,
                additionalHeightReduction: [108],
              }}
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
      animate={'show'}
    >
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
      variants={itemTransitionVariant}
    >
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
          className={'flex w-full text-stone-700 sm:grid dark:text-stone-300'}
        >
          <p className={'w-0 grow truncate sm:w-full'}>{itemName}</p>
          <span className={'hidden text-xs text-stone-500 sm:flex dark:text-stone-400'}>
            {share.share_uuid}
          </span>
        </div>
      </div>
      <div className={'ml-auto flex items-center gap-2'}>
        {share.share_target_username && (
          <p className={'text-xs text-stone-500 dark:text-stone-400'}>
            by @{share.share_target_username}
          </p>
        )}
        <SquareArrowOutUpRight className={'h-4 w-4'} />
      </div>
    </motion.li>
  );
}
