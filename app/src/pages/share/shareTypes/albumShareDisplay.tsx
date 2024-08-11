import { useAccessAlbumShare } from '@lib/query.ts';
import { AxiosError } from 'axios';
import { ShareMessage } from '@pages/share/shareMessage.tsx';
import { ShareError } from '@pages/share/shareError.tsx';
import { AlbumPageContent } from '@pages/explorer/pages/albums/single';
import { useScrollThreshold } from '@hooks/useScrollDirection.ts';
import { useRef } from 'react';
import { FileModel } from '@models/file.ts';
import { AlbumShareResponse } from '@models/album.ts';
import { Helmet } from 'react-helmet';

export function AlbumShareDisplay({ uuid }: { uuid: string }) {
  const share = useAccessAlbumShare(uuid);

  if (share.isLoading)
    return <ShareMessage text={`Loading album share...`} loading={true} />;
  if (!share.data)
    return <ShareError type={'album'} error={share.error as AxiosError} />;

  return <Content share={share.data} uuid={uuid} />;
}

function Content({ share, uuid }: { share: AlbumShareResponse; uuid: string }) {
  const container = useRef<HTMLDivElement>(null);
  const scrolling = useScrollThreshold(container, 20);

  return (
    <div className={'relative h-full'}>
      <Helmet>
        <title>{share.album.name ?? 'Shared Album'}</title>
      </Helmet>
      <div
        ref={container}
        className={
          'flex h-full max-h-[calc(100dvh-90px)] flex-col space-y-5 overflow-y-auto p-5 max-md:max-h-[calc(100dvh-90px-80px)]'
        }>
        {share && (
          <AlbumPageContent
            album={share.album}
            files={share.files as FileModel[]}
            scrolling={scrolling}
            shareUuid={uuid}
          />
        )}
      </div>
    </div>
  );
}
