import { useExplorerStore } from '@stores/explorerStore.ts';
import BreadCrumbs, { BreadCrumbItem } from '@components/BreadCrumbs.tsx';
import { SimpleDirectoryDTO } from '@bindings/SimpleDirectoryDTO.ts';
import { Home } from 'lucide-react';

export function FileListBreadCrumbs({
  crumbs,
  firstHome,
  shareUuid,
  clickOverwrite,
}: {
  crumbs: SimpleDirectoryDTO[];
  firstHome?: string;
  shareUuid?: string;
  clickOverwrite?: (id?: string) => void;
}) {
  const setDragDestination = useExplorerStore(s => s.dragMove.setDestination);

  function getLink(i: number, id: string) {
    if (clickOverwrite) return undefined;
    if (firstHome && i === 0) return firstHome;
    if (shareUuid) {
      return `/s/folder/${shareUuid}/${id}`;
    } else {
      return `/home/folder/${id}`;
    }
  }

  return (
    <BreadCrumbs>
      {!firstHome && (
        <BreadCrumbItem
          initial
          name={<Home className={'!w-4.5 !h-4.5'} />}
          href={!clickOverwrite ? '/home' : undefined}
          onClick={() => clickOverwrite?.(undefined)}
          last={!crumbs.length}
          onMouseEnter={() => setDragDestination(' ')}
          onMouseLeave={() => setDragDestination()}
        />
      )}
      {crumbs.map((item, i) => (
        <BreadCrumbItem
          last={i === crumbs.length - 1}
          key={`crumb-${item.id}`}
          name={item.folder_name}
          color={item.color}
          href={getLink(i, item.id)}
          onMouseEnter={() => setDragDestination(item.id)}
          onMouseLeave={() => setDragDestination()}
          onClick={() => clickOverwrite?.(item.id)}
        />
      ))}
    </BreadCrumbs>
  );
}
