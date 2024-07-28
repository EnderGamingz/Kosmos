import { FileModel } from '@models/file.ts';
import { motion } from 'framer-motion';

export function EmbedFile({
  file,
  serveUrl,
}: {
  file: FileModel;
  serveUrl: string;
}) {
  // Using 'object' because iframes seem to be blocked by browsers when loading the files
  return (
    <motion.object
      layoutId={`type-${file.id}`}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5 }}
      transition={{ duration: 0.3 }}
      className={
        'h-full w-full rounded-xl bg-stone-800/20 p-1 text-stone-50 shadow-lg backdrop-blur-md'
      }
      title={file.file_name}
      data={serveUrl}
    />
  );
}
