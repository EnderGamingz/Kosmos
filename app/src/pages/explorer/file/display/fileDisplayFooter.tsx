import { formatDistanceToNow } from 'date-fns';
import { ModalCloseButton } from '@pages/explorer/file/display/modalCloseButton.tsx';
import { FileModelDTO } from '@bindings/FileModelDTO.ts';
import { cn } from '@lib/utils.ts';

export function FileDisplayFooter({
  file,
  onClose,
}: {
  file: FileModelDTO;
  onClose?: () => void;
}) {
  return (
    <div className={'!mt-auto space-y-2'}>
      <div className={'animate-fade-in-top delay-200'}>
        {onClose && <ModalCloseButton onClick={onClose} />}
      </div>
      <div
        className={cn(
          'flex flex-col items-center justify-between gap-2 sm:flex-row',
          'text-xs text-stone-500',
          'dark:text-stone-400',
        )}>
        <p className={'animate-fade-in-left delay-300'}>
          Created {formatDistanceToNow(file.created_at, { addSuffix: true })}
        </p>
        <p className={'animate-fade-in-right delay-400'}>
          Updated {formatDistanceToNow(file.updated_at, { addSuffix: true })}
        </p>
      </div>
    </div>
  );
}
