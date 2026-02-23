import { useContext, useState } from 'react';
import { FilePreviewStatus, FileType } from '@models/file.ts';
import { DisplayContext, type DisplayContextType } from '@lib/contexts.ts';
import { createPreviewUrl } from '@lib/file.ts';
import { cn } from '@lib/utils.ts';
import { Skeleton } from '@components/ui/skeleton.tsx';
import { OctagonAlert, TriangleAlert } from 'lucide-react';

export function PreviewImage({
  id,
  alt,
  status,
  type,
  dynamic,
}: {
  id: string;
  alt: string;
  status?: FilePreviewStatus | null;
  type?: FileType;
  dynamic?: boolean;
}) {
  const [loaded, setLoaded] = useState(false);
  const context: DisplayContextType | undefined = useContext(DisplayContext);

  const isUnavailable = status === FilePreviewStatus.Unavailable;
  const isReady = status === FilePreviewStatus.Ready;
  const isProcessing = status === FilePreviewStatus.Processing;
  const isFailed = status === FilePreviewStatus.Failed;

  const src = createPreviewUrl(
    context.shareUuid,
    !!context.shareUuid,
    id,
    !!context.viewSettings?.album,
  );

  return (
    <div
      className={cn(
        'img-container grid place-items-center *:col-span-full *:row-span-full',
        'shadow-inherit',
        dynamic ? 'min-h-20' : 'size-10',
        isUnavailable && 'rounded-xl outline outline-stone-400/50',
      )}
    >
      {(isReady || type === FileType.RawImage) && (
        <img
          loading={'lazy'}
          onLoad={() => setLoaded(true)}
          onError={() => setLoaded(true)}
          data-loaded={loaded}
          width={40}
          height={40}
          className={cn(
            'img relative z-10 aspect-square rounded-lg object-cover text-[0] opacity-0',
            'rounded-lg shadow-xl duration-300! transition-transform-opacity',
            'data-[loaded=true]:opacity-100 motion-reduce:transition-none',
            dynamic ? 'max-h-[400px] min-h-16' : 'h-10 w-10',
          )}
          src={src}
          alt={alt}
        />
      )}
      {!isUnavailable && !isFailed && (!loaded || isProcessing) && (
        <Skeleton className={cn('h-full w-full', 'rounded-lg shadow-inner')} />
      )}

      {isFailed && (
        <OctagonAlert
          className={'h-8 w-8 text-red-500/20 dark:text-red-400/30'}
        />
      )}
      {isUnavailable && (
        <TriangleAlert
          className={'h-8 w-8 text-gray-500/20 dark:text-gray-400/30'}
        />
      )}
    </div>
  );
}
