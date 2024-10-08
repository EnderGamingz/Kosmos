import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';
import { createServeUrl } from '@lib/file.ts';
import { DisplayContext, DisplayContextType } from '@lib/contexts.ts';
import { useContext } from 'react';

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
    <button onClick={openInNew}>
      <ArrowTopRightOnSquareIcon />
      Open
    </button>
  );
}
