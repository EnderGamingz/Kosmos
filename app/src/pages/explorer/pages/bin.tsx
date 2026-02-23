import {
  invalidateBin,
  invalidateUsage,
  useDeletedFiles,
  useUsageStats,
} from '@lib/query.ts';
import { useFormatBytes } from '@utils/fileSize.ts';
import { motion } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { BASE_URL } from '@lib/env.ts';
import ExplorerDataDisplay from '@pages/explorer/displayAlternatives/display/explorerDisplay.tsx';
import SubPageTitle from '@pages/explorer/components/subPageTitle.tsx';
import { PageMetadata } from '@components/metadata.tsx';
import { Button } from '@components/ui/button.tsx';
import { Shredder } from 'lucide-react';

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
    <div className={'file-list relative flex h-full flex-col overflow-y-auto'}>
      <PageMetadata title={'Trash Bin'} />
      <div className={'flex items-center justify-between px-5 pt-5'}>
        <div>
          <SubPageTitle>Trash bin</SubPageTitle>
          <motion.p
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className={'text-stone-800 dark:text-stone-400'}
          >
            {usageData?.bin !== undefined
              ? `${binUsage} of files`
              : 'Loading...'}
          </motion.p>
        </div>
        {!!deletedFiles.data?.length && (
          <Button
            variant={'outline'}
            className={
              'border-primary bg-transparent animate-fade-in-right delay-300'
            }
            onClick={() => deleteAll.mutate()}
            disabled={deleteAll.isPending || !deletedFiles.data?.length}
          >
            <Shredder />
            Clear Trash
          </Button>
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
