import { FolderModel } from '@models/folder.ts';
import { Link } from 'react-router-dom';
import { Checkbox } from '@nextui-org/react';
import { formatDistanceToNow } from 'date-fns';
import tw from '@lib/classMerge.ts';
import { EllipsisVerticalIcon } from '@heroicons/react/24/outline';
import { useKeyStore } from '@stores/keyStore.ts';
import ConditionalWrapper from '@components/ConditionalWrapper.tsx';
import { motion } from 'framer-motion';

import {
  itemTransitionVariant,
  transitionStop,
} from '@components/transition.ts';
import ItemIcon from '@pages/explorer/components/ItemIcon.tsx';
import { useContext } from 'react';
import { DisplayContext } from '@lib/contexts.ts';
import { useShallow } from 'zustand/react/shallow';

export function TableFolderItem({
  i,
  folder,
  selected,
  onSelect,
}: {
  i: number;
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
    <motion.tr
      layout
      variants={i < transitionStop ? itemTransitionVariant : undefined}
      onClick={() => {
        if (isControl) onSelect(folder.id);
        if (isShift) contextMenu.select.setRange(i);
      }}
      onContextMenu={e => {
        e.preventDefault();
        contextMenu.handleContext({ x: e.clientX, y: e.clientY }, folder);
      }}
      className={tw(
        'group transition-all [&_td]:p-3 [&_th]:p-3',
        'hover:bg-stone-500/10 hover:shadow-sm',
        isSelected && 'bg-indigo-100',
        isShift && 'cursor-pointer hover:scale-95',
        contextMenu.select.rangeStart === i && 'scale-95 bg-indigo-50',
      )}>
      <th>
        <Checkbox
          isSelected={isSelected}
          onValueChange={() => onSelect(folder.id)}
        />
      </th>
      <td className={'!p-0'}>
        <div className={'flex w-full items-center gap-2'}>
          <ConditionalWrapper
            wrapper={c => (
              <Link
                className={'flex w-full items-center gap-2'}
                to={`/home/folder/${folder.id.toString()}`}>
                {c}
              </Link>
            )}
            condition={!isControl && !isShift}>
            <ItemIcon
              id={folder.id}
              name={folder.folder_name}
              type={'folder'}
            />
            <span className={'w-full'}>{folder.folder_name}</span>
          </ConditionalWrapper>
          <button
            onClick={e => {
              contextMenu.handleContext({ x: e.clientX, y: e.clientY }, folder);
            }}
            className={'cursor-pointer p-2'}>
            <EllipsisVerticalIcon className={'h-6 w-6 text-stone-700'} />
          </button>
        </div>
      </td>
      <td align={'right'}></td>
      <td
        align={'right'}
        className={'whitespace-nowrap text-sm font-light lg:text-base'}>
        {formatDistanceToNow(folder.updated_at)}
      </td>
    </motion.tr>
  );
}
