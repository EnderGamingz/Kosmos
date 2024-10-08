import {
  invalidateBin,
  invalidateUsage,
  useDeletedFiles,
  useUsageStats,
} from '@lib/query.ts';
import { useFormatBytes } from '@utils/fileSize.ts';
import { Progress } from '@nextui-org/react';
import { motion } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { BASE_URL } from '@lib/env.ts';
import ExplorerDataDisplay from '@pages/explorer/displayAlternatives/explorerDisplay.tsx';
import { Helmet } from 'react-helmet';
import SubPageTitle from '@pages/explorer/components/subPageTitle.tsx';

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

  const binUsage = useFormatBytes(usageData?.bin || 0);

  return (
    <div
      className={
        'file-list relative flex h-full max-h-[calc(100dvh-90px)] flex-col overflow-y-auto max-md:max-h-[calc(100dvh-90px-80px)]'
      }>
      <Helmet>
        <title>Trash Bin</title>
      </Helmet>
      <Progress
        aria-label={'Recent Files loading...'}
        isIndeterminate={!deletedFiles?.data || deletedFiles.isLoading}
        value={100}
        className={'absolute left-0 top-0 h-1 opacity-50'}
        color={'default'}
      />
      <div className={'flex items-center justify-between px-5 pt-5'}>
        <div>
          <SubPageTitle>Trash bin</SubPageTitle>
          <motion.p
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className={'text-stone-800 dark:text-stone-400'}>
            {usageData?.bin !== undefined ? binUsage : 'Loading...'}
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
  );
}
