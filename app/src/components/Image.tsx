import tw from '@lib/classMerge.ts';
import { useState } from 'react';
import { Skeleton } from '@nextui-org/react';
import { FilePreviewStatus, FileType } from '@models/file.ts';
import {
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

export function PreviewImage({
  id,
  src,
  alt,
  status,
  type,
  dynamic,
}: {
  id: string;
  src: string;
  alt: string;
  status?: FilePreviewStatus;
  type?: FileType;
  dynamic?: boolean;
}) {
  const [loaded, setLoaded] = useState(false);

  const isUnavailable = status === FilePreviewStatus.Unavailable;
  const isReady = status === FilePreviewStatus.Ready;
  const isProcessing = status === FilePreviewStatus.Processing;
  const isFailed = status === FilePreviewStatus.Failed;
  return (
    <motion.div
      layoutId={`image-${id}`}
      className={tw(
        'img-container grid place-items-center [&>*]:col-[1/-1] [&>*]:row-[1/-1]',
        'shadow-inherit',
        dynamic ? 'min-h-20' : 'h-[40px] w-[40px]',
        isUnavailable && 'rounded-xl outline outline-1 outline-stone-400/50',
      )}>
      {(isReady || type === FileType.RawImage) && (
        <motion.img
          loading={'lazy'}
          onLoad={() => setLoaded(true)}
          onError={() => setLoaded(true)}
          data-loaded={loaded}
          width={40}
          height={40}
          className={tw(
            'img img relative z-10 aspect-square rounded-lg object-cover text-[0] opacity-0',
            'rounded-lg shadow-xl !duration-300 transition-transform-opacity',
            'data-[loaded=true]:opacity-100 motion-reduce:transition-none',
            !dynamic && 'h-10 w-10',
          )}
          src={src}
          alt={alt}
        />
      )}
      {!isUnavailable && (!loaded || isProcessing) && (
        <Skeleton
          className={tw(
            'h-full w-full',
            'rounded-lg !bg-transparent shadow-inner',
          )}
        />
      )}
      {isFailed && (
        <ExclamationCircleIcon className={'h-8 w-8 text-red-500/20'} />
      )}
      {isUnavailable && (
        <ExclamationTriangleIcon className={'h-8 w-8 text-gray-500/20'} />
      )}
    </motion.div>
  );
}
