import { motion } from 'framer-motion';
import tw from '@utils/classMerge.ts';
import { useFormatBytes } from '@utils/fileSize.ts';
import { DownloadSingleAction } from '@pages/explorer/components/download.tsx';

export function ImageTooLargePrompt({
  threshold,
  id,
  name,
}: {
  threshold: number;
  id: string;
  name: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0, transition: { delay: 0.3 } }}
      exit={{ opacity: 0, scale: 0, transition: { duration: 0.2 } }}
      className={
        'absolute inset-0 flex h-full w-full items-center justify-center'
      }>
      <div
        className={tw(
          'space-y-3 rounded-xl bg-black/40 p-3 text-white backdrop-blur-lg',
          '[&>button>svg]:h-6 [&>button>svg]:w-6 [&>button]:flex',
          '[&>button]:gap-2 [&>button]:bg-stone-200 [&>button]:p-1 [&>button]:text-stone-800',
          '[&>button]:w-full [&>button]:justify-center [&>button]:rounded-md [&>button]:px-3',
          'outline outline-1 outline-stone-400/40',
        )}>
        <p className={'text-lg'}>Image is above {useFormatBytes(threshold)}</p>
        <DownloadSingleAction id={id} name={name} />
      </div>
    </motion.div>
  );
}
