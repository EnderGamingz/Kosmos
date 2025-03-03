import { useState } from 'react';
import { useFolders } from '@lib/query.ts';
import { motion } from 'framer-motion';
import { ContextOperationType } from '@models/file.ts';
import { ArrowRightIcon } from '@heroicons/react/24/solid';
import { useMove } from '@pages/explorer/components/move/useMove.tsx';
import { FileModelDTO } from '@bindings/FileModelDTO.ts';
import { FolderModelDTO } from '@bindings/FolderModelDTO.ts';
import { cn } from '@lib/utils.ts';
import {
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@components/ui/dialog.tsx';
import { LoaderCircle } from 'lucide-react';

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
          className={'flex flex-wrap items-center gap-2 overflow-hidden'}>
          Move {getMoveDescription()}
          {moveData.type !== 'multi' && (
            <span
              title={moveData.name}
              className={
                'max-w-[250px] overflow-hidden text-ellipsis whitespace-nowrap rounded-md bg-stone-200 py-1 px-1.5 dark:bg-stone-700'
              }>
              {moveData.name}
            </span>
          )}
        </DialogTitle>
        <DialogDescription
          className={
            'flex justify-between gap-1 text-sm font-normal text-muted-foreground'
          }>
          <span>
            Moving to <ArrowRightIcon className={'inline h-3 w-3'} />{' '}
            {data?.folder?.folder_name || 'Home'}{' '}
          </span>
          {isLoading && (
            <LoaderCircle
              aria-label={'Folder loading...'}
              className={'w-4 h-4 animate-spin'}
            />
          )}
        </DialogDescription>
      </DialogHeader>
      <div className={'min-h-32'}>
        <ul
          className={cn(
            '[&_li:hover]:bg-indigo-100 [&_li]:cursor-pointer [&_li]:rounded-md [&_li]:px-2 [&_li]:py-1 [&_li]:transition-colors',
            'dark:[&_li:hover]:bg-indigo-700/50 dark:[&_li]:text-stone-100',
          )}>
          {data?.folder && (
            <motion.li
              onClick={handleChangeFolder(
                data?.folder?.parent_id || undefined,
              )}>
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
                onClick={handleChangeFolder(folder.id)}>
                {folder.folder_name}
              </motion.li>
            ))}
        </ul>
      </div>
      <DialogFooter className={'justify-between'}>
        <button onClick={onClose} className={'btn-white'}>
          Cancel
        </button>
        <button
          disabled={selectedFolder === parent || moveAction.isPending}
          onClick={() => moveAction.mutate()}
          className={'btn-black'}>
          {moveAction.isPending ? 'Moving' : 'Move here'}
        </button>
      </DialogFooter>
    </>
  );
}
