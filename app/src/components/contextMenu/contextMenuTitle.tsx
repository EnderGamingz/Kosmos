import { ContextOperationType } from '@models/file.ts';
import tw from '@utils/classMerge.ts';
import {
  DocumentIcon,
  FolderIcon,
  Square2StackIcon,
} from '@heroicons/react/24/outline';
import { ReactNode } from 'react';

const iconMap = {
  folder: <FolderIcon />,
  multi: <Square2StackIcon />,
  album: <Square2StackIcon />,
  default: <DocumentIcon />,
};

export function ContextMenuTitle({
  title,
  type,
  children,
}: {
  title: string;
  type: ContextOperationType | 'album';
  children?: ReactNode;
}) {
  function renderIcon() {
    return iconMap[type as keyof typeof iconMap] || iconMap.default;
  }

  return (
    <div
      className={
        'max-w-[inherit] overflow-hidden overflow-ellipsis border-b border-stone-300/50 pb-1'
      }>
      <span
        title={title}
        className={tw(
          'flex items-center gap-1 whitespace-nowrap text-sm font-light text-stone-800',
          '[&_>svg]:h-4 [&_>svg]:min-w-4',
        )}>
        {renderIcon()}
        {title}
        {children && <div className={'ml-auto'}>{children}</div>}
      </span>
    </div>
  );
}
