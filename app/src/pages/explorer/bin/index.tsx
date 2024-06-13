import {
  invalidateBin,
  invalidateUsage,
  useDeletedFiles,
  useUsage,
} from '@lib/query.ts';
import { formatBytes } from '@lib/fileSize.ts';
import { Progress } from '@nextui-org/react';
import { AnimatePresence, motion } from 'framer-motion';
import { BinItem } from './binItem.tsx';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { BASE_URL } from '@lib/vars.ts';

export default function BinPage() {
  const { data: usageData } = useUsage();
  const deletedFiles = useDeletedFiles();

  const deleteAll = useMutation({
    mutationFn: () => axios.post(`${BASE_URL}auth/file/bin/clear`),
    onSuccess: () => {
      invalidateBin().then();
      invalidateUsage().then();
    },
  });

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
        <div className={'flex items-center justify-between'}>
          <motion.h1
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className={'text-3xl font-semibold text-stone-800'}>
            Trash bin
          </motion.h1>
          {!!deletedFiles.data?.length && (
            <motion.button
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ delay: 0.2 }}
              className={'btn-white rounded-lg px-2 py-1'}
              onClick={() => deleteAll.mutate()}
              disabled={deleteAll.isPending || !deletedFiles.data?.length}>
              Clear Trash
            </motion.button>
          )}
        </div>
        <motion.p
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}>
          {usageData?.bin ? formatBytes(usageData?.bin) : 'Loading...'}
        </motion.p>
        <motion.div
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className={'mt-5 grid grid-cols-3 gap-2 overflow-hidden'}>
          <AnimatePresence>
            {deletedFiles.data?.length ? (
              deletedFiles.data.map(file => (
                <BinItem key={file.id} file={file} />
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
        </motion.div>
      </div>
    </>
  );
}
