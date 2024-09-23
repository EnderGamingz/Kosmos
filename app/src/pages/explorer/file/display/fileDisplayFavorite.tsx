import { motion } from 'framer-motion';
import tw from '@utils/classMerge.ts';
import Favorite from '@pages/explorer/components/favorite.tsx';
import { FileModelDTO } from '@bindings/FileModelDTO.ts';

export function FileDisplayFavorite({
  file,
  onUpdate,
}: {
  file: FileModelDTO;
  onUpdate: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: [0, 0], scale: 0.5 }}
      className={tw(
        'absolute -right-3 -top-12 rounded-xl bg-[inherit] p-1 shadow-lg md:-top-10',
        '[&_svg]:h-7 [&_svg]:w-7',
      )}>
      <Favorite
        id={file.id}
        type={'file'}
        active={file.favorite}
        iconOnly
        onUpdate={onUpdate}
      />
    </motion.div>
  );
}
