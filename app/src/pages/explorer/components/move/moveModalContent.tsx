import { useState } from 'react';
import { useFolders } from '@lib/query.ts';
import { motion } from 'framer-motion';
import type { ContextOperationType } from '@models/file.ts';
import { useMove } from '@pages/explorer/components/move/useMove.tsx';
import type { FileModelDTO } from '@bindings/FileModelDTO.ts';
import type { FolderModelDTO } from '@bindings/FolderModelDTO.ts';
import { cn } from '@lib/utils.ts';
import {
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@components/ui/dialog.tsx';
import { ArrowRight, LoaderCircle } from 'lucide-react';
import { Button } from '@components/ui/button.tsx';

export type MoveData = {
  id?: string;
  type: ContextOperationType;
  name?: string;
};

export type MultiMoveData = {
  files: FileModelDTO[];
  folders: FolderModelDTO[];
};

export function MoveModalContent({
  moveData,
  multiData,
  parent,
  onClose,
}: {
  moveData: MoveData;
  multiData?: MultiMoveData;
  parent?: string | null;
  onClose: () => void;
}) {
  const [selectedFolder, setSelectedFolder] = useState(parent || undefined);
  const { data, isLoading } = useFolders(selectedFolder);

  const handleChangeFolder = (id?: string) => () => {
    if (!data) return;
    setSelectedFolder(id);
  };

  const moveAction = useMove(moveData, multiData, selectedFolder, onClose);

  function getMoveDescription() {
    if (moveData.type === 'multi') {
      const number =
        (multiData?.files.length || 0) + (multiData?.folders.length || 0);
      return `${number} item${number > 1 ? 's' : ''}`;
    } else {
      return moveData.type;
    }
  }

  return (
    <>
      <DialogHeader className='grid gap-1'>
        <DialogTitle
          className={'flex flex-wrap items-center gap-2 overflow-hidden'}
        >
          Move {getMoveDescription()}
          {moveData.type !== 'multi' && (
            <span
              title={moveData.name}
              className={
                'max-w-62.5 overflow-hidden text-ellipsis whitespace-nowrap rounded-md bg-stone-200 py-1 px-1.5 dark:bg-stone-700'
              }
            >
              {moveData.name}
            </span>
          )}
        </DialogTitle>
        <DialogDescription
          asChild
          className={
            'flex gap-1 text-sm font-normal text-muted-foreground overflow-hidden'
          }
        >
          <div className={'flex items-center gap-1 overflow-hidden w-full'}>
            Moving to <ArrowRight className={'inline h-3 w-3'} />{' '}
            <span
              className={
                'max-w-80 overflow-hidden text-ellipsis whitespace-nowrap rounded-md bg-stone-200 py-1 px-1.5 dark:bg-stone-700'
              }
            >
              {data?.folder?.folder_name || 'Home'}{' '}
            </span>
            {isLoading && (
              <LoaderCircle
                aria-label={'Folder loading...'}
                className={'ml-auto size-4 animate-spin'}
              />
            )}
          </div>
        </DialogDescription>
      </DialogHeader>
      <div className={'min-h-32 overflow-y-auto'}>
        <ul
          className={cn(
            '[&_li:hover]:bg-indigo-100 [&_li]:rounded-md [&_li]:px-2 [&_li]:py-1 [&_li]:transition-colors',
            'dark:[&_li:hover]:bg-indigo-700/50 dark:[&_li]:text-stone-100',
          )}
        >
          {data?.folder && (
            <motion.li
              onClick={handleChangeFolder(data?.folder?.parent_id || undefined)}
              className={'cursor-pointer italic font-black'}
            >
              ..
            </motion.li>
          )}
          {data?.folders
            // Prevent folders from being able to be moved into themselves
            .filter(x => {
              const isSingleParent = x.id !== moveData.id;
              const isMultiParent = !multiData?.folders.includes(x);

              return isSingleParent && isMultiParent;
            })
            .map(folder => (
              <motion.li
                layout
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.2, bounce: 0.1 }}
                key={folder.id}
                onClick={handleChangeFolder(folder.id)}
                className={
                  'w-full overflow-hidden text-ellipsis whitespace-nowrap rounded-md cursor-pointer'
                }
                title={folder.folder_name}
              >
                {folder.folder_name}
              </motion.li>
            ))}
        </ul>
      </div>
      <DialogFooter className={'justify-between'}>
        <DialogClose asChild>
          <Button variant={'outline'}>Cancel</Button>
        </DialogClose>
        <Button
          disabled={selectedFolder === parent || moveAction.isPending}
          onClick={() => moveAction.mutate()}
        >
          {moveAction.isPending ? 'Moving' : 'Move here'}
        </Button>
      </DialogFooter>
    </>
  );
}
