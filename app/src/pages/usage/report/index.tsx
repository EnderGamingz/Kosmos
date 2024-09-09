import { useUsageReport, useUsageStats } from '@lib/query.ts';
import { motion } from 'framer-motion';
import { UsageReportStats } from '@pages/usage/report/usageReportStats.tsx';
import { UsageReportByType } from '@pages/usage/report/usageReportByType.tsx';
import { NoAccess } from '@components/overlay/noAccess.tsx';
import { UsageReportLargeFiles } from '@pages/usage/report/usageReportLargeFiles.tsx';
import { Helmet } from 'react-helmet';

export default function UsageReport() {
  const report = useUsageReport();
  const usage = useUsageStats();

  const isLoading = report.isLoading || usage.isLoading;
  const isError = report.error || usage.error;

  return (
    <div
      className={
        'mx-auto flex w-full max-w-5xl flex-grow flex-col space-y-6 p-5 md:p-10'
      }>
      <Helmet>
        <title>Usage Report</title>
      </Helmet>
      <motion.h1
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.2, delay: 0.1 }}
        className={'text-2xl font-bold text-stone-700 dark:text-stone-300'}>
        Usage Report
      </motion.h1>
      {isLoading && !isError && (
        <div className={'grid flex-grow place-content-center'}>
          <div className={'app-loading-indicator'} />
        </div>
      )}
      {isError && (
        <NoAccess
          page={'Usage Report'}
          error={report.error?.message || usage.error?.message}
        />
      )}
      {report.data && usage.data && !isError && (
        <>
          <UsageReportStats report={report.data} usage={usage.data} />
          <UsageReportByType types={report.data.by_file_type} />
          <UsageReportLargeFiles files={report.data.large_files} />
        </>
      )}
    </div>
  );
}
