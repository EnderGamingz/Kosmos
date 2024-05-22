import {
  DownloadItem,
  DownloadStatus,
  useDownloadState,
} from '../../stores/downloadStore.ts';
import { useMemo, useState } from 'react';
import { Collapse } from 'react-collapse';
import {
  ArrowDownTrayIcon,
  CheckIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/solid';
import cn from '../../lib/classMerge.ts';
import { CircularProgress, Progress } from '@nextui-org/react';

function DownloadListItem({ item }: { item: DownloadItem }) {
  const STATUS_MESSAGES: { [key in DownloadStatus]?: string } = {
    [DownloadStatus.INITIATED]: 'Processing archive...',
    [DownloadStatus.PROGRESS]: 'Downloading...',
    [DownloadStatus.FINISHED]: 'Complete',
  };

  return (
    <div className={'flex py-1'}>
      <div>
        <p
          className={
            'max-w-72 overflow-hidden overflow-ellipsis whitespace-nowrap'
          }>
          {item.name}
        </p>
        {item.description && (
          <p className={'inline text-xs text-slate-500'}>
            {item.description} &bull;{' '}
          </p>
        )}
        <p className={'inline text-xs text-slate-500'}>
          {STATUS_MESSAGES[item.status] || null}
        </p>
      </div>
      <CircularProgress
        className={'ml-auto'}
        valueLabel={<CheckIcon className={'h-5 w-5 text-green-500'} />}
        showValueLabel={item.status === DownloadStatus.FINISHED}
        classNames={{
          indicator:
            item.status === DownloadStatus.FINISHED
              ? 'stroke-green-500'
              : item.status === DownloadStatus.FAILED
                ? 'stroke-red-500'
                : '',
        }}
        size={'sm'}
        value={
          [DownloadStatus.FINISHED, DownloadStatus.FAILED].some(
            x => x === item.status,
          )
            ? 100
            : undefined
        }
        aria-label={'Loading...'}
      />
    </div>
  );
}

export default function DownloadsList() {
  const [open, setOpen] = useState(false);
  const downloads = useDownloadState(s => s.items);

  const isLoading = useMemo(() => {
    return downloads.some(
      x =>
        x.status === DownloadStatus.INITIATED ||
        x.status === DownloadStatus.PROGRESS,
    );
  }, [downloads]);

  return (
    <div
      className={cn(
        'fixed bottom-10 right-10 w-full transition-all',
        open ? 'max-w-sm' : 'max-w-[15rem]',
      )}>
      <div
        className={cn(
          'grid w-full overflow-hidden rounded-md bg-slate-200 shadow-md transition-all',
          'hover:shadow-lg',
        )}>
        <div
          onClick={() => setOpen(!open)}
          className={'cursor-pointer rounded-md px-4 py-2 hover:bg-slate-300'}>
          <div className={'flex items-center text-slate-700'}>
            <ArrowDownTrayIcon className={'mr-2 h-5 w-5'} /> Download list
            <ChevronDownIcon
              className={cn(
                'ml-auto h-4 w-4 transition-all',
                open && 'rotate-180',
              )}
            />
          </div>
        </div>
        {isLoading ? (
          <Progress isIndeterminate className={'h-0.5'} />
        ) : (
          <div className={'h-0.5'} />
        )}
        <Collapse isOpened={open}>
          <div
            className={
              'max-h-64 divide-y divide-slate-300 overflow-y-auto px-4 py-2'
            }>
            {!!downloads.length ? (
              downloads.map(item => (
                <DownloadListItem key={item.id} item={item} />
              ))
            ) : (
              <p className={'text-center text-sm text-slate-500'}>
                No downloads
              </p>
            )}
          </div>
        </Collapse>
      </div>
    </div>
  );
}
