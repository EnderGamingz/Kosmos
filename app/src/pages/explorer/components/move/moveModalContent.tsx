import { useState } from 'react';
import { useFolders } from '@lib/query.ts';
import {
  CircularProgress,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Tooltip,
} from '@nextui-org/react';
import { motion } from 'framer-motion';
import { ContextOperationType } from '@models/file.ts';
import { ArrowRightIcon } from '@heroicons/react/24/solid';
import { useMove } from '@pages/explorer/components/move/useMove.tsx';

export type MoveData = {
  id?: string;
  type: ContextOperationType;
  name?: string;
};

export type MultiMoveData = {
  files: string[];
  folders: string[];
};

export function MoveModalContent({
  moveData,
  multiData,
  parent,
  onClose,
}: {
  moveData: MoveData;
  multiData?: MultiMoveData;
  parent?: string;
  onClose: () => void;
}) {
  const [selectedFolder, setSelectedFolder] = useState(parent);
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
      <ModalHeader className='grid gap-1'>
        <h2 className={'flex flex-wrap gap-1 overflow-hidden'}>
          Move {getMoveDescription()}
          {moveData.type !== 'multi' && (
            <Tooltip content={moveData.name}>
              <p
                className={
                  'max-w-[250px] overflow-hidden text-ellipsis whitespace-nowrap rounded-md bg-slate-200 px-1'
                }>
                {moveData.name}
              </p>
            </Tooltip>
          )}
        </h2>
        <div
          className={
            'flex justify-between gap-1 text-sm font-normal text-slate-600'
          }>
          <div>
            Moving to <ArrowRightIcon className={'inline h-3 w-3'} />{' '}
            {data?.folder?.folder_name || 'Home'}{' '}
          </div>
          {isLoading && (
            <CircularProgress
              aria-label={'Folder loading...'}
              classNames={{
                svg: 'w-4 h-4',
              }}
              isIndeterminate
            />
          )}
        </div>
      </ModalHeader>
      <ModalBody className={'min-h-32'}>
        <ul
          className={
            '[&_li:hover]:bg-indigo-100 [&_li]:cursor-pointer [&_li]:rounded-md [&_li]:px-2 [&_li]:py-1 [&_li]:transition-colors'
          }>
          {data?.folder && (
            <motion.li onClick={handleChangeFolder(data?.folder?.parent_id)}>
              ..
            </motion.li>
          )}
          {data?.folders
            // Prevent folders from being able to be moved into themselves
            .filter(x => {
              const isSingleParent = x.id !== moveData.id;
              const isMultiParent = !multiData?.folders.includes(x.id);

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
      </ModalBody>
      <ModalFooter className={'justify-between'}>
        <button
          onClick={onClose}
          className={
            'rounded-md px-3 py-1 text-slate-600 outline outline-1 outline-slate-600'
          }>
          Cancel
        </button>
        <button
          disabled={selectedFolder === parent || moveAction.isPending}
          onClick={() => moveAction.mutate()}
          className={
            'rounded-md bg-indigo-300 px-3 py-1 transition-all disabled:opacity-70 disabled:grayscale'
          }>
          {moveAction.isPending ? 'Moving' : 'Move here'}
        </button>
      </ModalFooter>
    </>
  );
}
