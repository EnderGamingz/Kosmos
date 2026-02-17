import { createServeUrl } from '@lib/file.ts';
import { DisplayContext, type DisplayContextType } from '@lib/contexts.ts';
import { useContext } from 'react';
import { SquareArrowOutUpRight } from 'lucide-react';

export default function OpenExternally({
  id,
  shareUuid,
}: {
  id: string;
  shareUuid?: string;
}) {
  const context: DisplayContextType | undefined = useContext(DisplayContext);
  const folderShareUuid = context?.shareUuid;
  const url = createServeUrl(
    shareUuid || folderShareUuid,
    !!folderShareUuid,
    id,
    false,
  );

  const openInNew = () => window.open(url, '_blank');

  return (
    <button type={'button'} onClick={openInNew}>
      <SquareArrowOutUpRight />
      Open
    </button>
  );
}
