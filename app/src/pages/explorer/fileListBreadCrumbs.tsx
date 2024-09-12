import { useExplorerStore } from '@stores/explorerStore.ts';
import BreadCrumbs, { BreadCrumbItem } from '@components/BreadCrumbs.tsx';
import { HomeIcon } from '@heroicons/react/24/outline';
import { SimpleDirectoryDTO } from '@bindings/SimpleDirectoryDTO.ts';

export function FileListBreadCrumbs({
  crumbs,
  firstHome,
  shareUuid,
}: {
  crumbs: SimpleDirectoryDTO[];
  firstHome?: string;
  shareUuid?: string;
}) {
  const setDragDestination = useExplorerStore(s => s.dragMove.setDestination);

  return (
    <BreadCrumbs>
      {!firstHome && (
        <BreadCrumbItem
          name={<HomeIcon />}
          href={'/home'}
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
          href={
            firstHome && i === 0
              ? firstHome
              : shareUuid
                ? `/s/folder/${shareUuid}/${item.id}`
                : `/home/folder/${item.id}`
          }
          onMouseEnter={() => setDragDestination(item.id)}
          onMouseLeave={() => setDragDestination()}
        />
      ))}
    </BreadCrumbs>
  );
}
