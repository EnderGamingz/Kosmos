import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { useKeyStore } from '@stores/keyStore.ts';
import ItemIcon from '@pages/explorer/components/ItemIcon.tsx';
import { useContext } from 'react';
import { DisplayContext } from '@lib/contexts.ts';
import { useShallow } from 'zustand/react/shallow';
import { FolderModelDTO } from '@bindings/FolderModelDTO.ts';
import { cn } from '@lib/utils.ts';
import { Check, EllipsisVertical } from 'lucide-react';

export function MobileFolderItem({
  i,
  folder,
  selected,
  onSelect,
}: {
  i: number;
  folder: FolderModelDTO;
  selected: string[];
  onSelect: (folder: FolderModelDTO) => void;
}) {
  const { isControl, isShift } = useKeyStore(
    useShallow(s => ({ isControl: s.keys.ctrl, isShift: s.keys.shift })),
  );

  const isSelected = selected.includes(folder.id);
  const context = useContext(DisplayContext);

  const navigate = useNavigate();

  const handleFolderClick = () => {
    if (isControl || isShift) return;
    if (context.viewSettings?.handleOverwrites?.onFolderClick) {
      context.viewSettings?.handleOverwrites?.onFolderClick(
        folder.id.toString(),
      );
      return;
    }
    navigate(
      context.shareUuid
        ? `/s/folder/${context.shareUuid}/${folder.id.toString()}`
        : `/home/folder/${folder.id.toString()}`,
    );
  };

  const selectDisabled = context.viewSettings?.selectDisable?.folders;

  return (
    <div
      onClick={() => {
        if (isControl && !selectDisabled) onSelect(folder);
        if (isShift) context.select.setRange(i);
        if (!isShift && !isControl) handleFolderClick();
      }}
      onContextMenu={e => {
        e.stopPropagation();
        e.preventDefault();
        context.handleContext({ x: e.clientX, y: e.clientY }, folder);
      }}
      className={cn(
        'group/listItem flex items-center group transition-colors p-3 gap-2 rounded-lg hover:bg-border',
        isSelected && 'bg-indigo-100 dark:bg-indigo-700/50',
        isShift && 'cursor-pointer',
        context.select.rangeStart === i && 'bg-indigo-50 dark:bg-indigo-600/60',
      )}>
      <div
        onClick={e => {
          e.stopPropagation();
          if (!context.viewSettings?.noSelect) onSelect(folder);
        }}
        className={'cursor-pointer relative'}>
        <div
          className={cn(
            'rounded-lg',
            isSelected && 'bg-popover brightness-50',
          )}>
          <ItemIcon id={folder.id} name={folder.folder_name} type={'folder'} />
        </div>
        {!context.viewSettings?.noSelect && (
          <Check
            className={cn(
              'w-7 h-7 transition-opacity text-white absolute transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 z-10',
              !isSelected ? 'opacity-0' : 'opacity-100',
            )}
          />
        )}
      </div>
      <div className={'flex flex-col overflow-hidden'}>
        <p className={'truncate'}>{folder.folder_name}</p>
        <div className={'flex gap-1 flex-wrap text-xs text-muted-foreground'}>
          <p>Modified {formatDistanceToNow(folder.updated_at)}</p>
        </div>
      </div>
      <button
        className={'p-2 cursor-pointer ml-auto'}
        onClick={e => {
          e.stopPropagation();
          context.handleContext({ x: e.clientX, y: e.clientY }, folder);
        }}>
        <EllipsisVertical className={'w-5 h-5'} />
      </button>
    </div>
  );
}
