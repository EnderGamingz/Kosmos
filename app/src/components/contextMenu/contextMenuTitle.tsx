import { ContextOperationType } from '@models/file.ts';
import { ReactNode } from 'react';
import { cn } from '@lib/utils.ts';
import { File, Folder, Images, Plus, Shapes } from 'lucide-react';

const iconMap = {
  folder: Folder,
  multi: Shapes,
  album: Images,
  create: Plus,
  default: File,
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
  const Icon = iconMap[type as keyof typeof iconMap] || iconMap.default;

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
        <span className={'ml-auto min-w-4'}>
          <Icon className={'h-4 w-4'} />
        </span>
      </div>
    </div>
  );
}
