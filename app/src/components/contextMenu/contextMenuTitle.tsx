import { ContextOperationType } from '@models/file.ts';
import {
  DocumentIcon,
  FolderIcon,
  Square2StackIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import { ReactNode } from 'react';
import { cn } from '@lib/utils.ts';

const iconMap = {
  folder: <FolderIcon />,
  multi: <Square2StackIcon />,
  album: <Square2StackIcon />,
  create: <PlusIcon />,
  default: <DocumentIcon />,
};

export function ContextMenuTitle({
  title,
  type,
  children,
}: {
  title: string;
  type: ContextOperationType | 'album' | 'create';
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
      <div
        title={title}
        className={cn(
          'flex items-center gap-2 whitespace-nowrap text-sm font-light text-stone-800 dark:text-stone-300',
          '[&_>svg]:h-4 [&_>svg]:min-w-4',
        )}>
        {children}
        <span className={'truncate'}>{title}</span>
        <span className={'ml-auto min-w-4'}>{renderIcon()}</span>
      </div>
    </div>
  );
}
