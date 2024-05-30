import {
  invalidateBin,
  invalidateUsage,
  useDeletedFiles,
  useUsage,
} from '../../lib/query.ts';
import { formatBytes } from '../../lib/fileSize.ts';
import { Chip, Progress, Tooltip } from '@nextui-org/react';
import { FileModel, getFileType } from '../../../models/file.ts';
import { formatDistanceToNow } from 'date-fns';
import { TrashIcon } from '@heroicons/react/24/outline';
import { ArrowPathRoundedSquareIcon } from '@heroicons/react/24/solid';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { BASE_URL } from '../../vars.ts';
import { AnimatePresence, motion } from 'framer-motion';

export default function BinPage() {
  const { data: usageData } = useUsage();
  const deletedFiles = useDeletedFiles();

  return (
    <>
      <Progress
        aria-label={'Bin loading...'}
        isIndeterminate={!usageData?.bin || deletedFiles.isLoading}
        value={100}
        className={'h-1 opacity-50'}
        color={'default'}
      />
      <div className={'p-5'}>
        <h1 className={'text-3xl font-semibold text-stone-800'}>Trash bin</h1>
        <p>{usageData?.bin ? formatBytes(usageData?.bin) : 'Loading...'}</p>
        <div className={'mt-5 grid grid-cols-3 gap-2 overflow-hidden'}>
          <AnimatePresence>
            {deletedFiles.data?.length ? (
              deletedFiles.data.map(file => (
                <TrashItem key={file.id} file={file} />
              ))
            ) : (
              <motion.span
                layout
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className={'col-span-12 text-center text-stone-600'}>
                No files in trash
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}

function TrashItem({ file }: { file: FileModel }) {
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
        <Chip>{getFileType(file.file_type)}</Chip>
        <Chip variant={'bordered'} color={'secondary'}>
          {formatBytes(file.file_size)}
        </Chip>
      </div>
      <p className={'mt-1 text-xs'}>
        Deleted {formatDistanceToNow(file.deleted_at || 0)}
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
