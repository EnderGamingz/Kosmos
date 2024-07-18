import {
  invalidateBin,
  invalidateUsage,
  useDeletedFiles,
  useUsageStats,
} from '@lib/query.ts';
import { formatBytes } from '@lib/fileSize.ts';
import { Progress } from '@nextui-org/react';
import { motion } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { BASE_URL } from '@lib/vars.ts';
import ExplorerDataDisplay from '@pages/explorer/displayAlternatives/explorerDisplay.tsx';

export default function BinPage() {
  const { data: usageData } = useUsageStats();
  const deletedFiles = useDeletedFiles();

  const deleteAll = useMutation({
    mutationFn: () => axios.post(`${BASE_URL}auth/file/bin/clear`),
    onSuccess: () => {
      invalidateBin().then();
      invalidateUsage().then();
    },
  });

  return (
    <div className={'relative'}>
      <div
        className={
          'file-list relative flex h-full max-h-[calc(100dvh-90px)] flex-col overflow-y-auto max-md:max-h-[calc(100dvh-90px-80px)]'
        }>
        <Progress
          aria-label={'Recent Files loading...'}
          isIndeterminate={!deletedFiles?.data || deletedFiles.isLoading}
          value={100}
          className={'absolute left-0 top-0 h-1 opacity-50'}
          color={'default'}
        />
        <div className={'flex items-center justify-between px-5 pt-5'}>
          <div>
            <motion.h1
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className={'text-3xl font-semibold text-stone-800'}>
              Trash bin
            </motion.h1>
            <motion.p
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}>
              {usageData?.bin !== undefined
                ? formatBytes(usageData?.bin)
                : 'Loading...'}
            </motion.p>
          </div>
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
        <div>
          <ExplorerDataDisplay
            isLoading={deletedFiles.isLoading}
            files={deletedFiles.data || []}
            folders={[]}
            viewSettings={{
              limitedView: true,
              binView: true,
              scrollControlMissing: true,
              noSelect: true,
              noDisplay: true,
            }}
          />
        </div>
      </div>
    </div>
  );
}
