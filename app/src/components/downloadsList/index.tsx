import {
  DownloadStatus,
  useDownloadState,
} from '../../stores/downloadStore.ts';
import { useState } from 'react';
import { Collapse } from 'react-collapse';
import {
  ArrowDownTrayIcon,
  CheckIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/solid';
import cn from '../../lib/classMerge.ts';
import { CircularProgress } from '@nextui-org/react';

export default function DownloadsList() {
  const [open, setOpen] = useState(false);
  const downloads = useDownloadState(s => s.items);

  console.log(downloads);
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
        <Collapse isOpened={open}>
          <div
            className={
              'max-h-64 divide-y divide-slate-300 overflow-y-auto px-4 py-2'
            }>
            {!!downloads.length ? (
              downloads.map(item => (
                <div className={'flex py-1'} key={item.id}>
                  <div>
                    {item.name}
                    {item.description && (
                      <p className={'text-xs text-slate-500'}>
                        {item.description}
                      </p>
                    )}
                  </div>
                  <CircularProgress
                    className={'ml-auto'}
                    valueLabel={
                      <CheckIcon className={'h-5 w-5 text-green-500'} />
                    }
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
