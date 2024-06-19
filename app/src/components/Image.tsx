import tw from '@lib/classMerge.ts';
import { useState } from 'react';
import { Skeleton } from '@nextui-org/react';
import { FilePreviewStatus, FileType } from '@models/file.ts';
import {
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

export function PreviewImage({
  src,
  alt,
  status,
  type,
}: {
  src: string;
  alt: string;
  status?: FilePreviewStatus;
  type?: FileType;
}) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div
      className={
        'grid h-[40px] w-[40px] place-items-center [&>*]:col-[1/-1] [&>*]:row-[1/-1]'
      }>
      {(status === FilePreviewStatus.Ready || type === FileType.RawImage) && (
        <img
          loading={'lazy'}
          onLoad={() => setLoaded(true)}
          onError={() => setLoaded(true)}
          data-loaded={loaded}
          width={40}
          height={40}
          className={tw(
            'img img relative z-10 aspect-square h-10 w-10 rounded-lg object-cover text-[0] opacity-0',
            '!duration-300 transition-transform-opacity data-[loaded=true]:opacity-100 motion-reduce:transition-none',
          )}
          src={src}
          alt={alt}
        />
      )}
      {(!loaded || status === FilePreviewStatus.Processing) && (
        <Skeleton
          className={'h-10 w-10 rounded-lg !bg-transparent shadow-inner'}
        />
      )}
      {status === FilePreviewStatus.Failed && (
        <ExclamationCircleIcon className={'h-8 w-8 text-red-500/20'} />
      )}
      {status === FilePreviewStatus.Unavailable && (
        <ExclamationTriangleIcon className={'h-8 w-8 text-gray-500/20'} />
      )}
    </div>
  );
}
