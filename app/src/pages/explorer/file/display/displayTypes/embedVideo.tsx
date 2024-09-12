import { motion } from 'framer-motion';
import { FileModelDTO } from '@bindings/FileModelDTO.ts';

export default function EmbedVideo({
  file,
  serveUrl,
}: {
  file: FileModelDTO;
  serveUrl: string;
}) {
  return (
    <motion.video
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5 }}
      transition={{ duration: 0.3 }}
      controls
      className={'absolute inset-0 h-full w-full object-scale-down'}
      title={file.file_name}>
      <source src={serveUrl} type={'video/mp4'} />;
    </motion.video>
  );
}
