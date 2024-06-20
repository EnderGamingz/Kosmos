import { FileModel, FileType, getFileTypeString } from '@models/file.ts';
import { DisplayImage } from '@pages/explorer/file/display/displayImage.tsx';
import { motion } from 'framer-motion';
import tw from '@lib/classMerge.ts';
import ItemIcon from '@pages/explorer/components/ItemIcon.tsx';

export function FileDisplayHandler({
  file,
  fullScreen,
  onFullScreen,
}: {
  file: FileModel;
  fullScreen: boolean;
  onFullScreen: (b: boolean) => void;
}) {
  const isImage = [FileType.Image, FileType.RawImage].includes(file.file_type);

  if (isImage)
    return (
      <DisplayImage
        file={file}
        fullScreen={fullScreen}
        onFullScreen={onFullScreen}
      />
    );

  /*  if (file.file_type === FileType.Document) {
    return (
      <object
        className={'h-full w-full rounded-xl shadow-lg'}
        data={`${BASE_URL}auth/file/raw/${file.id}`}
        type='application/pdf'
      />
    );
  }*/

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5 }}
      transition={{ duration: 0.3 }}
      className={tw(
        'flex h-full w-full flex-col items-center justify-center',
        'rounded-xl bg-stone-800/20 text-stone-700 shadow-xl',
        'outline outline-1 -outline-offset-1 outline-stone-500',
        'pr-5 text-center [&_svg]:h-20 [&_svg]:w-20',
      )}>
      <ItemIcon id={file.id} name={file.file_name} type={file.file_type} />
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ delay: 0.35 }}>
        {getFileTypeString(file.file_type)} File
      </motion.p>
    </motion.div>
  );
}
