import { FolderModel } from '@models/folder.ts';
import { useKeyStore } from '@stores/keyStore.ts';
import { useShallow } from 'zustand/react/shallow';
import { useContext } from 'react';
import { DisplayContext } from '@lib/contexts.ts';
import {
  itemTransitionVariant,
  transitionStop,
} from '@components/transition.ts';
import { motion } from 'framer-motion';
import ItemIcon from '@pages/explorer/components/ItemIcon.tsx';
import ConditionalWrapper from '@components/ConditionalWrapper.tsx';
import { Link } from 'react-router-dom';
import { EllipsisVerticalIcon } from '@heroicons/react/24/outline';
import tw from '@lib/classMerge.ts';
import { Checkbox } from '@nextui-org/react';

export default function GridFolderItem({
  index,
  folder,
  selected,
  onSelect,
}: {
  index: number;
  folder: FolderModel;
  selected: string[];
  onSelect: (id: string) => void;
}) {
  const { isControl, isShift } = useKeyStore(
    useShallow(s => ({
      isControl: s.keys.ctrl,
      isShift: s.keys.shift,
    })),
  );
  const isSelected = selected.includes(folder.id);
  const contextMenu = useContext(DisplayContext);

  return (
    <motion.div
      layout
      variants={index < transitionStop ? itemTransitionVariant : undefined}
      onClick={() => {
        if (isControl) onSelect(folder.id);
        if (isShift) contextMenu.select.setRange(index);
      }}
      onContextMenu={e => {
        e.preventDefault();
        contextMenu.handleContext({ x: e.clientX, y: e.clientY }, folder);
      }}
      className={tw(
        'group flex w-full items-center rounded-lg bg-stone-400/40',
        'shadow-md transition-all hover:bg-stone-500/40 hover:shadow-lg',
        isSelected && 'bg-indigo-100',
        isShift && 'cursor-pointer hover:scale-95',
        contextMenu.select.rangeStart === index && 'scale-95 bg-indigo-50',
      )}>
      <div className={'relative min-h-10 min-w-10'}>
        <div
          className={tw(
            'absolute inset-0 z-10 grid h-10 w-10 place-items-center opacity-0',
            'transition-opacity group-hover:opacity-100',
            isSelected && 'opacity-100',
          )}>
          <Checkbox
            className={'h-5 w-5 p-0'}
            isSelected={isSelected}
            onValueChange={() => onSelect(folder.id)}
          />
        </div>
        <div
          className={tw(
            'absolute transition-opacity group-hover:opacity-0',
            isSelected && 'opacity-0',
          )}>
          <ItemIcon id={folder.id} name={folder.folder_name} type={'folder'} />
        </div>
      </div>
      <ConditionalWrapper
        wrapper={c => (
          <Link
            className={'flex h-full flex-grow items-center'}
            to={`/home/folder/${folder.id.toString()}`}>
            {c}
          </Link>
        )}
        alt={c => <div className={'flex-grow'}>{c}</div>}
        condition={!isControl && !isShift}>
        <div className={'flex flex-grow items-center'}>
          <span
            className={
              'w-0 flex-grow overflow-hidden overflow-ellipsis whitespace-nowrap'
            }>
            {folder.folder_name}
          </span>
        </div>
      </ConditionalWrapper>
      <button
        onClick={e => {
          contextMenu.handleContext({ x: e.clientX, y: e.clientY }, folder);
        }}
        className={'cursor-pointer p-2'}>
        <EllipsisVerticalIcon className={'h-6 w-6 text-stone-700'} />
      </button>
    </motion.div>
  );
}
