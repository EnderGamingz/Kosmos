import { FileModel } from '@models/file.ts';
import { BASE_URL } from '@lib/vars.ts';
import { AnimatePresence, motion } from 'framer-motion';
import tw from '@lib/classMerge.ts';
import { formatBytes } from '@lib/fileSize.ts';
import { DownloadSingleAction } from '@pages/explorer/components/download.tsx';
import {
  ArrowsPointingInIcon,
  ArrowsPointingOutIcon,
} from '@heroicons/react/24/outline';
import { Portal } from 'react-portal';

export function DisplayImage({
  file,
  fullScreen,
  onFullScreen,
}: {
  file: FileModel;
  fullScreen: boolean;
  onFullScreen: (b: boolean) => void;
}) {
  // 75 MiB
  const IMAGE_SIZE_THRESHOLD = 75 * 1024 * 1024;
  const isTooLarge = file.file_size > IMAGE_SIZE_THRESHOLD;

  const lowRes = `${BASE_URL}auth/file/image/${file.id}/0`;
  const highRes = `${BASE_URL}auth/file/${file.id}/action/Serve`;

  const toggleFullScreen = () => {
    if (isTooLarge) return;
    onFullScreen(!fullScreen);
  };

  return (
    <>
      <AnimatePresence>
        {fullScreen && !isTooLarge && (
          <Portal>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={'fixed inset-0 z-[100] bg-white p-10'}>
              <motion.img
                onDoubleClick={toggleFullScreen}
                className={
                  'h-full w-full rounded-xl object-contain drop-shadow-lg'
                }
                layoutId={`image-${file.id}`}
                src={highRes}
                alt={file.file_name}
              />
              <motion.div
                onClick={toggleFullScreen}
                className={tw(
                  'absolute top-3 z-[110] [&>svg]:h-5 [&>svg]:w-5',
                  fullScreen ? 'right-3' : 'right-8',
                )}>
                {fullScreen ? (
                  <ArrowsPointingInIcon />
                ) : (
                  <ArrowsPointingOutIcon />
                )}
              </motion.div>
            </motion.div>
          </Portal>
        )}
      </AnimatePresence>
      <div className={'relative overflow-hidden'}>
        {!isTooLarge && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1, transition: { delay: 0.3 } }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={toggleFullScreen}
            className={tw(
              'absolute top-3 z-[110] rounded-full bg-gray-50/40 p-2 backdrop-blur-sm',
              '[&>svg]:h-5 [&>svg]:w-5',
              fullScreen ? 'right-3' : 'right-8',
            )}>
            {fullScreen ? <ArrowsPointingInIcon /> : <ArrowsPointingOutIcon />}
          </motion.div>
        )}
        {/* Background for transparent files */}
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
            isTooLarge && 'blur-sm',
            fullScreen
              ? 'bg-contain object-contain drop-shadow-lg'
              : 'bg-cover object-cover shadow-lg',
          )}
          layoutId={`image-${file.id}`}
          src={isTooLarge ? lowRes : highRes}
          style={{
            // Image background will serve as a low-quality placeholder
            // until the high-resolution image is downloaded
            backgroundImage: `url(${lowRes})`,
          }}
          alt={file.file_name}
        />
        {file.file_size > IMAGE_SIZE_THRESHOLD && (
          <div
            className={
              'absolute inset-0 flex h-full w-full items-center justify-center'
            }>
            <div
              className={tw(
                'space-y-3 rounded-xl bg-black/20 p-3 text-white backdrop-blur-lg',
                '[&>button>svg]:h-6 [&>button>svg]:w-6 [&>button]:flex',
                '[&>button]:gap-2 [&>button]:bg-gray-50 [&>button]:p-1 [&>button]:text-black',
                '[&>button]:w-full [&>button]:rounded-md [&>button]:px-3',
              )}>
              <p className={'text-lg'}>
                Image is above {formatBytes(IMAGE_SIZE_THRESHOLD)}
              </p>
              <DownloadSingleAction
                id={file.id}
                name={file.file_name}
                onClose={() => {}}
                type={'file'}
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
}
