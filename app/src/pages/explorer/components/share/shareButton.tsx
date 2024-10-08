import { ShareOperationType } from '@models/file.ts';
import tw from '@utils/classMerge.ts';
import { useExplorerStore } from '@stores/explorerStore.ts';
import { ShareIcon } from '@heroicons/react/24/outline';
import { useContext } from 'react';
import { DisplayContext } from '@lib/contexts.ts';

export default function ShareButton({
  id,
  type,
  iconOnly,
  onClose,
  className,
}: {
  id: string;
  type: ShareOperationType;
  iconOnly?: boolean;
  onClose?: () => void;
  className?: string;
}) {
  const setShare = useExplorerStore(s => s.share.setShareElement);
  const context = useContext(DisplayContext);
  if (context.shareUuid) return null;

  return (
    <button
      className={tw(
        'flex items-center gap-1',
        className || '',
        iconOnly ? 'p-2' : '',
      )}
      onClick={e => {
        e.stopPropagation();
        onClose?.();
        setShare(id, type);
      }}>
      <ShareIcon className={'h-6 w-6'} />
      {!iconOnly && 'Share'}
    </button>
  );
}
