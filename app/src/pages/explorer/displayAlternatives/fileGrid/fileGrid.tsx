import { useExplorerStore } from '@stores/folderStore.ts';
import { useKeyStore } from '@stores/keyStore.ts';
import { useContext } from 'react';
import { DisplayContext } from '@lib/contexts.ts';
import { SelectAllCheckBox } from '@pages/explorer/displayAlternatives/selectAllCheckBox.tsx';
import { motion } from 'framer-motion';
import {
  containerVariant,
  itemTransitionVariant,
} from '@components/transition.ts';
import tw from '@lib/classMerge.ts';
import GridFileItem from '@pages/explorer/file/gridFileItem.tsx';
import GridFolderItem from '@pages/explorer/folder/gridFolderItem.tsx';
import { formatBytes } from '@lib/fileSize.ts';
import { DetailType } from '@stores/preferenceStore.ts';
import Masonry, { ResponsiveMasonry } from 'react-responsive-masonry';
import ConditionalWrapper from '@components/ConditionalWrapper.tsx';

export default function FileGrid({
  dynamic,
  details,
}: {
  dynamic?: boolean;
  details: DetailType;
}) {
  const { folder: currentFolder } = useExplorerStore(s => s.current);
  const { selectedFolders, selectedFiles, selectFile, selectFolder } =
    useExplorerStore(s => s.selectedResources);

  const isControl = useKeyStore(s => s.keys.ctrl);
  const { files, folders } = useContext(DisplayContext);

  return (
    <div className={'px-5 py-2'}>
      <div className={'mb-3 flex items-center gap-2'}>
        <SelectAllCheckBox files={files} folders={folders} />
        <motion.p
          key={`count-${currentFolder}`}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className={'text-sm text-stone-500'}>
          {folders.length} Folders &bull; {files.length} Files
        </motion.p>
      </div>
      <motion.div
        variants={containerVariant()}
        initial={'hidden'}
        animate={'show'}
        key={`folders-${currentFolder}`}
        className={tw(
          'grid gap-3',
          'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
          'xl:grid-cols-5 2xl:grid-cols-7',
          tw(isControl && '[&>div]:cursor-copy'),
        )}>
        {folders.map((folder, i) => (
          <GridFolderItem
            key={folder.id}
            folder={folder}
            index={i}
            onSelect={selectFolder}
            selected={selectedFolders}
          />
        ))}
      </motion.div>
      <motion.div
        variants={containerVariant()}
        initial={'hidden'}
        animate={'show'}
        key={`files-${currentFolder}`}
        className={tw(
          'mt-6 gap-3',
          !dynamic &&
            'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-7',
          tw(isControl && '[&>div]:cursor-copy'),
        )}>
        <ConditionalWrapper
          wrapper={c => (
            <ResponsiveMasonry
              columnsCountBreakPoints={{
                320: 1,
                440: 2,
                768: 3,
                1024: 4,
                1280: 5,
                1536: 7,
              }}>
              <Masonry gutter={'0.75rem'}>{c}</Masonry>
            </ResponsiveMasonry>
          )}
          condition={dynamic}>
          {files.map((file, i) => (
            <GridFileItem
              key={file.id}
              file={file}
              index={folders.length + i}
              onSelect={selectFile}
              selected={selectedFiles}
              dynamic={dynamic}
              details={details}
            />
          ))}
        </ConditionalWrapper>
        <motion.div
          variants={itemTransitionVariant}
          className={tw(
            'w-full cursor-default select-none border-none text-sm text-stone-500/50',
            'col-span-1 sm:col-span-2 md:col-span-3 lg:col-span-4 xl:col-span-5',
            'flex gap-5 pb-28 pt-4',
          )}>
          <div>
            {folders.length} Folders <br />
            {files.length} Files
          </div>
          <div>{formatBytes(files.reduce((a, b) => a + b.file_size, 0))}</div>
        </motion.div>
      </motion.div>
    </div>
  );
}
