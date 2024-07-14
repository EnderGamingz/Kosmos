import { FileModel, FileType, getFileTypeString } from '@models/file.ts';
import { DisplayImage } from '@pages/explorer/file/display/image/displayImage.tsx';
import { motion } from 'framer-motion';
import tw from '@lib/classMerge.ts';
import ItemIcon from '@pages/explorer/components/ItemIcon.tsx';
import { BASE_URL } from '@lib/vars.ts';
import { useContext, useEffect, useState } from 'react';
import { DisplayContext } from '@lib/contexts.ts';
import { EmbedFile } from '@pages/explorer/file/display/embedFile.tsx';

export function FileTypeDisplay({
  id,
  name,
  type,
  noText,
  loading,
}: {
  id: string;
  name: string;
  type: FileType;
  noText?: boolean;
  loading?: boolean;
}) {
  return (
    <motion.div
      layoutId={`type-display-${id}`}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5 }}
      transition={{ duration: 0.3 }}
      className={tw(
        'flex h-full w-full flex-col items-center justify-center',
        'rounded-lg bg-stone-800/20 text-stone-200 shadow-xl [&_svg]:text-stone-200',
        'outline outline-1 -outline-offset-1 outline-stone-500',
        'pr-5 text-center backdrop-blur-md',
        loading ? '[&_svg]:h-14 [&_svg]:w-14' : '[&_svg]:h-20 [&_svg]:w-20',
      )}>
      <div className={'relative'}>
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
      {!noText && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ delay: 0.35 }}>
          {getFileTypeString(type)} File
        </motion.p>
      )}
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

  const initialLoadingState = (
    shareUuid?: string,
    isSharedInFolder?: boolean,
  ) => {
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

  const isImage = [FileType.Image, FileType.RawImage].includes(file.file_type);

  const highResUrl = shareUuid
    ? isSharedInFolder
      ? `${BASE_URL}s/folder/${shareUuid}/File/${file.id}/action/Serve`
      : `${BASE_URL}s/file/${shareUuid}/action/Serve`
    : `${BASE_URL}auth/file/${file.id}/action/Serve`;
  const lowResUrl = shareUuid
    ? isSharedInFolder
      ? `${BASE_URL}s/folder/${shareUuid}/image/${file.id}/0`
      : `${BASE_URL}s/file/${shareUuid}/image/0`
    : `${BASE_URL}auth/file/image/${file.id}/0`;

  useEffect(() => {
    if (!previewOnHold) return;
    const t = setTimeout(() => setPreviewOnHold(false), 500);
    return () => clearTimeout(t);
  }, [previewOnHold]);

  if (isImage)
    return (
      <DisplayImage
        file={file}
        fullScreen={fullScreen}
        onFullScreen={onFullScreen}
        highRes={previewOnHold ? lowResUrl : highResUrl}
        lowRes={lowResUrl}
        shareUuid={shareUuid}
      />
    );

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
