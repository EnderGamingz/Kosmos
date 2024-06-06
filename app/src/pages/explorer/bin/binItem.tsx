import { FileModel, getFileTypeString } from '../../../../models/file.ts';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { BASE_URL } from '../../../vars.ts';
import { invalidateBin, invalidateUsage } from '../../../lib/query.ts';
import { motion } from 'framer-motion';
import { Chip, Tooltip } from '@nextui-org/react';
import { formatBytes } from '../../../lib/fileSize.ts';
import { formatDistanceToNow } from 'date-fns';
import { TrashIcon } from '@heroicons/react/24/outline';
import { ArrowPathRoundedSquareIcon } from '@heroicons/react/24/solid';

export function BinItem({ file }: { file: FileModel }) {
  const deleteAction = useMutation({
    mutationFn: () => axios.delete(`${BASE_URL}auth/file/${file.id}`),
    onSuccess: () => {
      invalidateBin().then();
      invalidateUsage().then();
    },
  });

  const restoreAction = useMutation({
    mutationFn: () => axios.post(`${BASE_URL}auth/file/${file.id}/restore`),
    onSuccess: () => {
      invalidateBin().then();
      invalidateUsage().then();
    },
  });

  return (
    <motion.div
      layout
      exit={{
        opacity: 0,
        scale: 0.5,
      }}
      transition={{ duration: 0.1 }}
      className={'rounded-xl border border-stone-600/30 bg-stone-200/50 p-4'}>
      <Tooltip content={file.file_name}>
        <h2
          className={
            'w-fit max-w-full self-start overflow-hidden overflow-ellipsis whitespace-nowrap text-xl'
          }>
          {file.file_name}
        </h2>
      </Tooltip>
      <div className={'flex flex-wrap gap-1'}>
        <Chip>{getFileTypeString(file.file_type)}</Chip>
        <Chip variant={'bordered'} color={'secondary'}>
          {formatBytes(file.file_size)}
        </Chip>
      </div>
      <p className={'mt-1 text-xs'}>
        Deleted {formatDistanceToNow(file.deleted_at || 0)} ago
      </p>
      <div
        className={
          'mt-3 flex flex-wrap gap-2 border-t border-stone-800/10 pt-3 [&>button]:flex-1'
        }>
        <button onClick={() => deleteAction.mutate()} className={'btn-white'}>
          <TrashIcon /> Delete
        </button>
        <button onClick={() => restoreAction.mutate()} className={'btn-black'}>
          <ArrowPathRoundedSquareIcon /> Restore
        </button>
      </div>
    </motion.div>
  );
}
