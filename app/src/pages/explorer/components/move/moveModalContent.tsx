import { useState } from 'react';
import { invalidateData, useFolders } from '@lib/query.ts';
import {
  CircularProgress,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Tooltip,
} from '@nextui-org/react';
import { motion } from 'framer-motion';
import { DataOperationType } from '@models/file.ts';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { BASE_URL } from '@lib/vars.ts';
import { Severity, useNotifications } from '@stores/notificationStore.ts';
import { ArrowRightIcon } from '@heroicons/react/24/solid';
import { Collapse } from 'react-collapse';

export function MoveModalContent({
  moveData,
  parent,
  onClose,
}: {
  moveData: { id: string; type: DataOperationType; name: string };
  parent?: string;
  onClose: () => void;
}) {
  const [selectedFolder, setSelectedFolder] = useState(parent);
  const notifications = useNotifications(s => s.actions);
  const { data, isLoading } = useFolders(selectedFolder);

  const handleChangeFolder = (id?: string) => () => {
    if (!data) return;
    setSelectedFolder(id);
  };

  const moveAction = useMutation({
    mutationFn: async () => {
      const moveId = notifications.notify({
        title: `Move ${moveData.type}`,
        severity: Severity.INFO,
        loading: true,
      });
      await axios
        .put(
          `${BASE_URL}auth/${moveData.type}/move/${moveData.id}?folder_id=${selectedFolder}`,
        )
        .then(() => {
          notifications.updateNotification(moveId, {
            severity: Severity.SUCCESS,
            status: 'Moved',
            timeout: 1000,
          });

          invalidateData(moveData.type).then();
          onClose();
        })
        .catch(e => {
          notifications.updateNotification(moveId, {
            severity: Severity.ERROR,
            status: 'Error',
            description: e.response?.data?.error || 'Error',
            timeout: 2000,
          });
        });
    },
  });

  return (
    <>
      <ModalHeader className='grid gap-1'>
        <h2 className={'flex flex-wrap gap-1 overflow-hidden'}>
          Move {moveData.type}
          <Tooltip content={moveData.name}>
            <p
              className={
                'max-w-[250px] overflow-hidden text-ellipsis whitespace-nowrap rounded-md bg-slate-200 px-1'
              }>
              {moveData.name}
            </p>
          </Tooltip>
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
        <Collapse isOpened>
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
              .filter(x => x.id !== moveData.id)
              .map(folder => (
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
        </Collapse>
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
