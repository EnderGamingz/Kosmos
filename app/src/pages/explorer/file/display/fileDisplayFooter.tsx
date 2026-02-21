import { formatDistanceToNow } from 'date-fns';
import { ModalCloseButton } from '@pages/explorer/file/display/modalCloseButton.tsx';
import type { FileModelDTO } from '@bindings/FileModelDTO.ts';

export function FileDisplayFooter({
  file,
  onClose,
}: {
  file: FileModelDTO;
  onClose?: () => void;
}) {
  return (
    <div className={'mt-auto! space-y-2'}>
      <div className={'animate-fade-in-bottom delay-200'}>
        {onClose && <ModalCloseButton onClick={onClose} />}
      </div>
      <div
        className={
          'flex items-center justify-between gap-2 flex-wrap text-xs text-muted-foreground'
        }
      >
        <p className={'animate-fade-in delay-300'}>
          Created {formatDistanceToNow(file.created_at, { addSuffix: true })}
        </p>
        <p className={'animate-fade-in delay-300'}>
          Updated {formatDistanceToNow(file.updated_at, { addSuffix: true })}
        </p>
      </div>
    </div>
  );
}
