import { useContext, useRef } from 'react';
import { FilePreviewStatus, FileType } from '@models/file.ts';
import { DisplayContext, DisplayContextType } from '@lib/contexts.ts';
import { createPreviewUrl } from '@lib/file.ts';
import { cn } from '@lib/utils.ts';
import { Skeleton } from '@components/ui/skeleton.tsx';
import { OctagonAlert, TriangleAlert } from 'lucide-react';
import { useProtectedContent } from '@utils/getProtectedImage.ts';

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
  const imgRef = useRef<HTMLImageElement>(null);
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

  const { loaded, blobUrl } = useProtectedContent(src);

  return (
    <div
      className={cn(
        'img-container grid place-items-center [&>*]:col-[1/-1] [&>*]:row-[1/-1]',
        'shadow-inherit',
        dynamic ? 'min-h-20' : 'h-[40px] w-[40px]',
        isUnavailable && 'rounded-xl outline outline-stone-400/50',
      )}>
      {(isReady || type === FileType.RawImage) && (
        <img
          ref={imgRef}
          src={blobUrl}
          loading={'lazy'}
          data-loaded={loaded}
          width={40}
          height={40}
          className={cn(
            'img relative z-10 aspect-square rounded-lg object-cover text-[0] opacity-0',
            'rounded-lg shadow-xl !duration-300 transition-transform-opacity',
            'data-[loaded=true]:opacity-100 motion-reduce:transition-none',
            dynamic ? 'max-h-[400px] min-h-16' : 'h-10 w-10',
          )}
          alt={alt}
        />
      )}
      {!isUnavailable && !isFailed && (!loaded || isProcessing) && (
        <Skeleton className={cn('h-full w-full', 'rounded-lg shadow-inner')} />
      )}

      {isFailed && <OctagonAlert className={'h-8 w-8 text-red-500/20'} />}
      {isUnavailable && (
        <TriangleAlert className={'h-8 w-8 text-gray-500/20'} />
      )}
    </div>
  );
}
