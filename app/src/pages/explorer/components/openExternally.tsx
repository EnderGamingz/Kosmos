import { createServeUrl } from '@lib/file.ts';
import { DisplayContext, type DisplayContextType } from '@lib/contexts.ts';
import { useContext } from 'react';
import { CopyIcon, SquareArrowOutUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Copy } from '@pages/explorer/components/share/copy.tsx';

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

  return (
    <div className={'flex gap-1'}>
      <Copy text={url}>
        <CopyIcon className={'size-4! -mx-0.5'} />
      </Copy>
      <Link to={url} target={'_blank'}>
        <button type={'button'}>
          <SquareArrowOutUpRight />
          Open
        </button>
      </Link>
    </div>
  );
}
