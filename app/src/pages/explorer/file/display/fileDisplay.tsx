import { Backdrop } from '@components/backdrop.tsx';
import { AnimatePresence, motion } from 'framer-motion';
import { useExplorerStore } from '@stores/folderStore.ts';
import { FileModel, FileType } from '@models/file.ts';
import tw from '@lib/classMerge.ts';
import { Checkbox } from '@nextui-org/react';
import ItemIcon from '@pages/explorer/components/ItemIcon.tsx';
import { DisplayImage } from '@pages/explorer/file/display/displayImage.tsx';
import { formatDistanceToNow } from 'date-fns';
import { useState } from 'react';

export default function FileDisplay({
  file,
  isSelected,
  onSelect,
}: {
  file?: FileModel;
  isSelected: boolean;
  onSelect: (id: string) => void;
}) {
  const setFile = useExplorerStore(s => s.current.selectCurrentFile);
  const close = () => () => setFile(undefined);

  return (
    <AnimatePresence>
      {file && (
        <FileDisplayContent
          file={file}
          isSelected={isSelected}
          onSelect={onSelect}
          onClose={close()}
        />
      )}
    </AnimatePresence>
  );
}

function FileDisplayHandler({
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
    <div className={'grid h-full w-full place-items-center'}>
      <ItemIcon id={file.id} name={file.file_name} type={file.file_type} />
    </div>
  );
}

function FileDisplayContent({
  file,
  onClose,
  onSelect,
  isSelected,
}: {
  file: FileModel;
  onClose: () => void;
  onSelect: (id: string) => void;
  isSelected: boolean;
}) {
  const [fullsScreenPreview, setFullsScreenPreview] = useState(false);
  return (
    <>
      <Backdrop onClose={onClose} />
      <div
        className={tw(
          'pointer-events-none h-full max-h-[800px] w-full max-w-5xl',
          'fixed left-1/2 top-1/2 z-50 flex -translate-x-1/2 -translate-y-1/2',
        )}>
        <div
          className={
            'pointer-events-auto isolate m-10 grid w-full grid-cols-2'
          }>
          <div
            className={tw(
              '-mr-5 [&>*]:absolute [&>*]:inset-0',
              fullsScreenPreview ? 'z-20' : 'relative z-0',
            )}>
            <FileDisplayHandler
              file={file}
              fullScreen={fullsScreenPreview}
              onFullScreen={setFullsScreenPreview}
            />
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 100 }}
            animate={{ opacity: [0, 1], scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: 100 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className={tw(
              'z-10 flex w-full flex-col transition-all',
              'whitespace-nowrap rounded-xl bg-gray-50 p-3 md:p-6',
              'outline outline-2 -outline-offset-2 outline-transparent',
              isSelected && 'outline-blue-500',
            )}>
            <div className={'flex items-center gap-2'}>
              <motion.div layoutId={`check-${file.id}`}>
                <Checkbox
                  isSelected={isSelected}
                  onChange={() => onSelect(file.id)}
                />
              </motion.div>
              <motion.p
                exit={{ opacity: 0 }}
                layoutId={`title-${file.id}`}
                className={
                  'select-all whitespace-break-spaces break-all text-xl font-semibold'
                }>
                {file.file_name}
              </motion.p>
            </div>
            <div
              className={tw(
                'mt-auto flex flex-col items-center justify-between gap-2 md:flex-row',
                'text-xs text-stone-500',
              )}>
              <motion.p
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: 0.3 }}>
                Created{' '}
                {formatDistanceToNow(file.created_at, { addSuffix: true })}
              </motion.p>
              <motion.p layoutId={`updated-${file.id}`}>
                Updated{' '}
                {formatDistanceToNow(file.updated_at, { addSuffix: true })}
              </motion.p>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}
