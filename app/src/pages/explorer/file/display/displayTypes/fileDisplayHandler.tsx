import {
  FileModel,
  FileType,
  FileTypeActions,
  getFileTypeString,
} from '@models/file.ts';
import { DisplayImage } from '@pages/explorer/file/display/displayTypes/image/displayImage.tsx';
import { motion } from 'framer-motion';
import tw from '@utils/classMerge.ts';
import ItemIcon from '@pages/explorer/components/ItemIcon.tsx';
import { ReactNode, useContext, useEffect, useState } from 'react';
import { DisplayContext } from '@lib/contexts.ts';
import EmbedFile from '@pages/explorer/file/display/displayTypes/embedFile.tsx';
import EmbedVideo from '@pages/explorer/file/display/displayTypes/embedVideo.tsx';
import { createPreviewUrl, createServeUrl } from '@lib/file.ts';

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
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5 }}
      transition={{ duration: 0.3 }}
      className={tw(
        'relative flex h-full w-full flex-col items-center justify-center',
        'rounded-lg bg-stone-800/20 text-stone-200 shadow-xl [&_svg]:text-stone-200',
        'outline outline-1 -outline-offset-1 outline-stone-500',
        'pr-5 text-center backdrop-blur-md',
        loading ? '[&_svg]:h-14 [&_svg]:w-14' : '[&_svg]:h-20 [&_svg]:w-20',
      )}>
      <div className={tw('relative', shouldShowChildren && 'opacity-0')}>
        {loading && (
          <div
            className={
              'absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2'
            }>
            <div className={'app-loading-indicator !h-16 !w-16'} />
          </div>
        )}
        <ItemIcon id={id} name={name} type={type} />
      </div>
      {!noText && !shouldShowChildren && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ delay: 0.35 }}>
          {getFileTypeString(type)} File
        </motion.p>
      )}
      {!loading && children}
    </motion.div>
  );
}

export function FileDisplayHandler({
  file,
  fullScreen,
  onFullScreen,
  shareUuid,
}: {
  file: FileModel;
  fullScreen: boolean;
  onFullScreen: (b: boolean) => void;
  shareUuid?: string;
}) {
  const folderContext = useContext(DisplayContext);
  const isSharedInFolder = folderContext?.shareUuid;

  const initialLoadingState = () => {
    if (shareUuid && !isSharedInFolder) return;
    return [
      FileType.Image,
      FileType.Document,
      FileType.Audio,
      FileType.Video,
    ].includes(file.file_type);
  };

  // This artificial hold state is to prevent flicker in the preview
  // and prevent the app from lagging when displaying a file essentially on mobile devices
  const [previewOnHold, setPreviewOnHold] = useState(initialLoadingState());

  const highResUrl = createServeUrl(shareUuid, !!isSharedInFolder, file.id);
  const lowResUrl = createPreviewUrl(shareUuid, !!isSharedInFolder, file.id);

  useEffect(() => {
    if (!previewOnHold) return;
    const t = setTimeout(() => setPreviewOnHold(false), 500);
    return () => clearTimeout(t);
  }, [previewOnHold]);

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

  if (file.file_type === FileType.Document && !previewOnHold) {
    return <EmbedFile file={file} serveUrl={highResUrl} />;
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
