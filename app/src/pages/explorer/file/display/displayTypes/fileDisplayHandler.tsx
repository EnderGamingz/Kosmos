import { FileType, FileTypeActions, getFileTypeString } from '@models/file.ts';
import { DisplayImage } from '@pages/explorer/file/display/displayTypes/image/displayImage.tsx';
import ItemIcon from '@pages/explorer/components/ItemIcon.tsx';
import { ReactNode, useContext, useEffect, useState } from 'react';
import { DisplayContext } from '@lib/contexts.ts';
import EmbedFile from '@pages/explorer/file/display/displayTypes/embedFile.tsx';
import EmbedVideo from '@pages/explorer/file/display/displayTypes/embedVideo.tsx';
import { createPreviewUrl, createServeUrl } from '@lib/file.ts';
import { FileModelDTO } from '@bindings/FileModelDTO.ts';
import ArchiveDisplay from '@pages/explorer/file/display/displayTypes/archiveDisplay.tsx';
import { cn } from '@lib/utils.ts';
import EmbedAudio from '@pages/explorer/file/display/displayTypes/embedAudio.tsx';

export function FileTypeDisplay({
  id,
  name,
  type,
  noText,
  loading,
  children,
}: {
  id: string;
  name: string;
  type: FileType;
  noText?: boolean;
  loading?: boolean;
  children?: ReactNode;
}) {
  const shouldShowChildren = Boolean(children && !loading);
  return (
    <div
      className={cn(
        'relative flex h-full w-full flex-col items-center justify-center gap-5',
        'rounded-lg bg-stone-200/10  shadow-xl dark:bg-stone-500/10 text-stone-200',
        '[&_svg]:text-stone-200 pr-5 text-center backdrop-blur-lg',
        'outline -outline-offset-1 outline-stone-500/30',
        'animate-fade-in-right transition-all delay-100',
        loading && '[&_svg]:h-14 [&_svg]:w-14',
        !loading && shouldShowChildren && 'gap-0',
      )}>
      <div className={cn('relative', shouldShowChildren && 'h-0 opacity-0')}>
        {loading && (
          <div
            className={
              'absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2'
            }>
            <div className={'app-loading-indicator !h-16 !w-16'} />
          </div>
        )}
        {!shouldShowChildren && (
          <ItemIcon id={id} name={name} type={type} keySuffix={'display'} />
        )}
      </div>
      {!noText && !shouldShowChildren && (
        <p className={'animate-fade-in-top delay-100'}>
          {getFileTypeString(type)} File
        </p>
      )}
      {!loading && children}
    </div>
  );
}

export function FileDisplayHandler({
  file,
  fullScreen,
  onFullScreen,
  shareUuid,
}: {
  file: FileModelDTO;
  fullScreen: boolean;
  onFullScreen: (b: boolean) => void;
  shareUuid?: string;
}) {
  const folderContext = useContext(DisplayContext);
  const isSharedInFolder = folderContext?.shareUuid;

  const initialLoadingState = () => {
    if (shareUuid && !isSharedInFolder) return;
    return FileTypeActions.shouldDelayPreview(file);
  };

  // This artificial hold state is to prevent flicker in the preview
  // and prevent the app from lagging when displaying a file essentially on mobile devices
  const [previewOnHold, setPreviewOnHold] = useState(initialLoadingState());

  const highResUrl = createServeUrl(shareUuid, !!isSharedInFolder, file.id);
  const lowResUrl = createPreviewUrl(shareUuid, !!isSharedInFolder, file.id);

  useEffect(() => {
    if (!previewOnHold) return;
    const timeout = setTimeout(() => setPreviewOnHold(false), 500);
    return () => clearTimeout(timeout);
  }, [previewOnHold]);

  if (FileTypeActions.isZipArchive(file)) {
    return (
      <ArchiveDisplay
        loading={previewOnHold}
        file={file}
        share={{
          shareUuid: shareUuid,
          isSharedInFolder: !!isSharedInFolder,
        }}
      />
    );
  }

  if (FileTypeActions.isImage(file.file_type))
    return (
      <DisplayImage
        file={file}
        fullScreen={fullScreen}
        onFullScreen={onFullScreen}
        highRes={previewOnHold ? lowResUrl : highResUrl}
        lowRes={lowResUrl}
        share={{
          shareUuid: shareUuid,
          isSharedInFolder: !!isSharedInFolder,
        }}
      />
    );

  if (FileTypeActions.isVideo(file.file_type)) {
    return (
      <FileTypeDisplay
        id={file.id}
        name={file.file_name}
        type={file.file_type}
        loading={previewOnHold}>
        <EmbedVideo file={file} serveUrl={highResUrl} />
      </FileTypeDisplay>
    );
  }

  if (FileTypeActions.isAudio(file.file_type)) {
    return (
      <FileTypeDisplay
        id={file.id}
        name={file.file_name}
        type={file.file_type}
        loading={previewOnHold}>
        <EmbedAudio file={file} serveUrl={highResUrl} />
      </FileTypeDisplay>
    );
  }

  if (FileTypeActions.hasFileEmbedData(file) && !previewOnHold) {
    return (
      <EmbedFile file={file} serveUrl={highResUrl} isShared={!!shareUuid} />
    );
  }

  return (
    <FileTypeDisplay
      id={file.id}
      name={file.file_name}
      type={file.file_type}
      loading={previewOnHold}
    />
  );
}
