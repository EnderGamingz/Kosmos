import { FolderModel } from '@models/folder.ts';
import { Link } from 'react-router-dom';
import { Checkbox } from '@nextui-org/react';
import { formatDistanceToNow } from 'date-fns';
import tw from '@lib/classMerge.ts';
import { EllipsisVerticalIcon } from '@heroicons/react/24/outline';
import { useKeyStore } from '@stores/keyStore.ts';
import ConditionalWrapper from '@components/ConditionalWrapper.tsx';

export function FolderItem({
  folder,
  selected,
  onSelect,
  onContext,
}: {
  folder: FolderModel;
  selected: string[];
  onSelect: (id: string) => void;
  onContext: (folder: FolderModel, pos: { x: number; y: number }) => void;
}) {
  const isControl = useKeyStore(s => s.ctrl);
  const isSelected = selected.includes(folder.id);

  return (
    <tr
      onClick={() => {
        if (isControl) onSelect(folder.id);
      }}
      onContextMenu={e => {
        e.preventDefault();
        onContext(folder, { x: e.clientX, y: e.clientY });
      }}
      className={tw(
        'group transition-all [&_td]:p-3 [&_th]:p-3',
        isSelected && 'bg-indigo-100',
      )}>
      <th>
        <Checkbox
          isSelected={isSelected}
          onValueChange={() => onSelect(folder.id)}
        />
      </th>
      <td className={'!p-0'}>
        <div className={'flex w-full group-hover:bg-slate-200'}>
          <ConditionalWrapper
            wrapper={c => (
              <Link
                className={'w-full py-3'}
                to={`/home/folder/${folder.id.toString()}`}>
                {c}
              </Link>
            )}
            condition={!isControl}>
            <span className={'p-3'}>{folder.folder_name}</span>
          </ConditionalWrapper>
          <button
            onClick={e => {
              onContext(folder, { x: e.clientX, y: e.clientY });
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
    </tr>
  );
}
