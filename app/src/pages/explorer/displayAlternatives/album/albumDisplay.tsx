import { useContext } from 'react';
import { DisplayContext } from '@lib/contexts.ts';
import { PagedWrapper } from '@pages/explorer/displayAlternatives/fileTable/fileTable.tsx';
import Masonry, { ResponsiveMasonry } from 'react-responsive-masonry';
import { FileModel } from '@models/file.ts';
import { PreviewImage } from '@components/Image.tsx';
import tw from '@utils/classMerge.ts';
import { Vec2 } from '@pages/explorer/displayAlternatives/explorerDisplayWrapper.tsx';
import { AlbumFile } from '@models/album.ts';

export default function AlbumDisplay() {
  const { files, viewSettings, overwriteDisplay, handleContext } =
    useContext(DisplayContext);
  const columnsCountBreakPoints: Record<string, number> = {
    320: 1,
    440: 2,
    768: 3,
    1024: 4,
    1280: 5,
    1536: 7,
  };
  const breakPoints = Object.keys(columnsCountBreakPoints)
    .filter(Number)
    .slice(0, overwriteDisplay?.gridSize || 7);
  const columnsCount =
    columnsCountBreakPoints[breakPoints[breakPoints.length - 1]];

  return (
    <PagedWrapper viewSettings={viewSettings}>
      <div className={'overflow-hidden px-5 py-2'}>
        <ResponsiveMasonry
          columnsCountBreakPoints={Object.fromEntries(
            breakPoints.map(point => [point, columnsCount]),
          )}>
          <Masonry gutter={'0.75rem'}>
            {files.map(file => (
              <AlbumDisplayItem
                key={file.id}
                file={file}
                handleContext={handleContext}
                albumId={viewSettings?.albumId || ''}
              />
            ))}
          </Masonry>
        </ResponsiveMasonry>
      </div>
    </PagedWrapper>
  );
}

function AlbumDisplayItem({
  file,
  albumId,
  handleContext,
}: {
  file: FileModel;
  albumId: string;
  handleContext: (pos: Vec2, file: FileModel) => void;
}) {
  return (
    <div
      onContextMenu={e => {
        e.preventDefault();
        handleContext({ x: e.clientX, y: e.clientY }, {
          ...file,
          album_id: albumId,
        } as AlbumFile);
      }}
      className={tw(
        '[&_.img-container]:h-full [&_.img-container]:min-h-24 [&_.img-container]:w-full',
        '[&_img]:aspect-auto [&_img]:h-auto [&_img]:min-h-[inherit] [&_img]:w-full',
      )}>
      <PreviewImage
        id={file.id}
        status={file.preview_status}
        alt={file.file_name}
        type={file.file_type}
      />
    </div>
  );
}
