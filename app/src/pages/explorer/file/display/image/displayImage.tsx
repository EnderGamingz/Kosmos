import { FileModel } from '@models/file.ts';
import { motion } from 'framer-motion';
import tw from '@lib/classMerge.ts';
import {
  ImageFullscreenToggle,
  ImageFullscreenView,
} from '@pages/explorer/file/display/image/imageFullscreenView.tsx';
import { ImageTooLargePrompt } from '@pages/explorer/file/display/image/imageTooLargePrompt.tsx';
import { IMAGE_LOAD_SIZE_THRESHOLD } from '@lib/vars.ts';

export function DisplayImage({
  file,
  fullScreen,
  onFullScreen,
  lowRes,
  highRes,
  share,
}: {
  file: FileModel;
  fullScreen: boolean;
  onFullScreen: (b: boolean) => void;
  lowRes: string;
  highRes: string;
  share?: {
    shareUuid?: string;
    isSharedInFolder?: boolean;
  };
}) {
  // 75 MiB
  const isTooLarge = file.file_size > IMAGE_LOAD_SIZE_THRESHOLD;

  const toggleFullScreen = () => {
    if (isTooLarge) return;
    onFullScreen(!fullScreen);
  };

  return (
    <>
      <ImageFullscreenView
        open={fullScreen}
        tooLarge={isTooLarge}
        onDoubleClick={toggleFullScreen}
        file={file}
        src={highRes}
        noOffset={!!share?.shareUuid && !share?.isSharedInFolder}
      />
      <div className={'relative overflow-hidden rounded-xl'}>
        {!isTooLarge && (
          <ImageFullscreenToggle
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
        <motion.img
          exit={{ opacity: 0, scale: 0 }}
          onDoubleClick={toggleFullScreen}
          className={tw(
            'h-full w-full rounded-xl bg-center bg-no-repeat transition-colors',
            isTooLarge && 'scale blur-sm grayscale-[50%]',
            fullScreen
              ? 'bg-contain object-contain drop-shadow-lg'
              : 'bg-cover object-cover shadow-lg',
          )}
          layoutId={`image-${file.id}`}
          src={isTooLarge ? lowRes : highRes}
          style={{
            // Image background serves as a low-quality placeholder
            // until the high-resolution image is downloaded
            backgroundImage: `url(${lowRes})`,
          }}
          alt={file.file_name}
        />
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
