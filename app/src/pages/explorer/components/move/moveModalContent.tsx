import { useState } from 'react';
import { invalidateFiles, useFolders } from '../../../../lib/query.ts';
import {
  ModalBody,
  ModalFooter,
  ModalHeader,
  Tooltip,
} from '@nextui-org/react';
import { motion } from 'framer-motion';
import { OperationType } from '../../../../../models/file.ts';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { BASE_URL } from '../../../../vars.ts';

export function MoveModalContent({
  moveData,
  parent,
  onClose,
}: {
  moveData: { id: string; type: OperationType; name: string };
  parent?: string;
  onClose: () => void;
}) {
  const [selectedFolder, setSelectedFolder] = useState(parent);
  const { data } = useFolders(selectedFolder);

  const handleChangeFolder = (id?: string) => () => {
    if (!data) return;
    setSelectedFolder(id);
  };

  const moveAction = useMutation({
    mutationFn: () =>
      axios.put(
        `${BASE_URL}auth/${moveData.type}/move/${moveData.id}?folder_id=${selectedFolder}`,
      ),
    onSuccess: async () => {
      onClose();
      await invalidateFiles();
    },
  });

  return (
    <>
      <ModalHeader className='grid gap-1'>
        <h2 className={'flex gap-1'}>
          Move {moveData.type}
          <Tooltip content={moveData.name}>
            <p
              className={
                'max-w-[250px] overflow-hidden text-ellipsis whitespace-nowrap rounded-md bg-slate-200 px-1'
              }>
              {moveData.name}
            </p>
          </Tooltip>
          to:
        </h2>
        <p className={'text-sm font-normal text-slate-600'}>
          {data?.folder?.folder_name || 'Home'}
        </p>
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
          {data?.folders.map(folder => (
            <motion.li
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
