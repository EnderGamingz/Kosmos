import { FileModel } from '@models/file.ts';
import { motion } from 'framer-motion';
import tw from '@utils/classMerge.ts';
import {
  FullscreenToggle,
  ImageFullscreenView,
} from '@pages/explorer/file/display/displayTypes/image/imageFullscreenView.tsx';
import { ImageTooLargePrompt } from '@pages/explorer/file/display/displayTypes/image/imageTooLargePrompt.tsx';

import { IMAGE_LOAD_SIZE_THRESHOLD } from '@lib/constants.ts';

export function DisplayImage({
  file,
  fullScreen,
  onFullScreen,
  lowRes,
  highRes,
  share,
  onlyImage,
}: {
  file: FileModel;
  fullScreen?: boolean;
  onFullScreen?: (b: boolean) => void;
  lowRes?: string;
  highRes: string;
  onlyImage?: boolean;
  share?: {
    shareUuid?: string;
    isSharedInFolder?: boolean;
  };
}) {
  // 75 MiB
  const isTooLarge = file.file_size > IMAGE_LOAD_SIZE_THRESHOLD;

  const toggleFullScreen = () => {
    if (isTooLarge) return;
    onFullScreen?.(!fullScreen);
  };

  const isFullScreenAvailable = fullScreen !== undefined;

  const img = (
    <motion.img
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1, transition: { delay: 0.1 } }}
      exit={{ opacity: 0, scale: 0 }}
      onDoubleClick={toggleFullScreen}
      className={tw(
        'h-full w-full rounded-xl bg-center bg-no-repeat transition-colors',
        isTooLarge && 'scale blur-sm grayscale-[50%]',
        fullScreen
          ? 'bg-contain object-contain drop-shadow-lg'
          : 'bg-cover object-cover shadow-lg',
      )}
      layout
      layoutId={`image-${file.id}`}
      src={isTooLarge ? lowRes : highRes}
      style={{
        // Image background serves as a low-quality placeholder
        // until the high-resolution image is downloaded
        backgroundImage: lowRes && `url(${lowRes})`,
      }}
      alt={file.file_name}
    />
  );

  if (onlyImage) return img;

  return (
    <>
      {isFullScreenAvailable && (
        <ImageFullscreenView
          open={fullScreen}
          tooLarge={isTooLarge}
          onDoubleClick={toggleFullScreen}
          file={file}
          src={highRes}
          noOffset={!!share?.shareUuid && !share?.isSharedInFolder}
        />
      )}
      <div className={'relative overflow-hidden rounded-xl'}>
        {!isTooLarge && isFullScreenAvailable && (
          <FullscreenToggle
            isFullscreen={fullScreen}
            toggle={toggleFullScreen}
            noOffset={!!share?.shareUuid && !share?.isSharedInFolder}
          />
        )}
        {/* Background for transparent file previews */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { delay: 0.3 } }}
          exit={{ opacity: 0, transition: { duration: 0 } }}
          className={tw(
            'absolute inset-0 -z-10 rounded-xl bg-stone-800/20 text-stone-700 shadow-xl',
            'outline outline-1 -outline-offset-1 outline-stone-500',
          )}
        />
        {img}
        {file.file_size > IMAGE_LOAD_SIZE_THRESHOLD && (
          <ImageTooLargePrompt
            threshold={IMAGE_LOAD_SIZE_THRESHOLD}
            id={file.id}
            name={file.file_name}
          />
        )}
      </div>
    </>
  );
}
