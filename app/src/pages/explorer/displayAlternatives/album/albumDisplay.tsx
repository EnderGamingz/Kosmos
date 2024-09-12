import { useContext, useEffect, useState } from 'react';
import { DisplayContext } from '@lib/contexts.ts';
import Masonry, { ResponsiveMasonry } from 'react-responsive-masonry';
import { PreviewImage } from '@components/Image.tsx';
import tw from '@utils/classMerge.ts';
import { Vec2 } from '@pages/explorer/displayAlternatives/explorerDisplayWrapper.tsx';
import { AlbumFile } from '@models/album.ts';
import { PagedWrapper } from '@pages/explorer/displayAlternatives/pagedWrapper.tsx';
import { AlbumModelDTO } from '@bindings/AlbumModelDTO.ts';
import { FileModelDTO } from '@bindings/FileModelDTO.ts';

export default function AlbumDisplay() {
  const { overwriteDisplay, viewSettings } = useContext(DisplayContext);
  const [render, setRender] = useState(false);

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

  const columnsCountMap = Object.fromEntries(
    breakPoints.map(point => [point, columnsCount]),
  );

  // Masonry doesn't place items correctly if not navigated to from another page
  // this fixes that
  useEffect(() => {
    const t = setTimeout(() => setRender(true), 1);
    return () => {
      clearTimeout(t);
    };
  }, [columnsCountMap]);

  return (
    <PagedWrapper viewSettings={viewSettings}>
      <div className={'h-full overflow-hidden px-5 py-2'}>
        {render && <Content breakPoints={columnsCountMap} />}
      </div>
    </PagedWrapper>
  );
}

function Content({
  breakPoints,
}: {
  breakPoints: {
    // noinspection JSUnusedLocalSymbols
    [p: string]: number;
  };
}) {
  const { files, viewSettings, handleContext } = useContext(DisplayContext);

  return (
    <ResponsiveMasonry columnsCountBreakPoints={breakPoints}>
      <Masonry gutter={'0.75rem'}>
        {files.map(file => (
          <AlbumDisplayItem
            key={file.id}
            file={file}
            handleContext={handleContext}
            onClick={viewSettings?.album?.onFileClick}
            album={viewSettings?.album?.data}
          />
        ))}
      </Masonry>
    </ResponsiveMasonry>
  );
}

function AlbumDisplayItem({
  file,
  album,
  handleContext,
  onClick,
}: {
  file: FileModelDTO;
  album?: AlbumModelDTO;
  handleContext: (pos: Vec2, file: FileModelDTO) => void;
  onClick?: (file: FileModelDTO) => void;
}) {
  return (
    <div
      onClick={() => onClick?.(file)}
      onContextMenu={e => {
        e.preventDefault();
        handleContext({ x: e.clientX, y: e.clientY }, {
          ...file,
          album,
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
