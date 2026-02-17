import { FileTypeActions } from '@models/file.ts';
import { DownloadSingleAction } from '@pages/explorer/components/download.tsx';
import { RenameAction } from '@pages/explorer/components/rename';
import { MoveAction } from '@pages/explorer/components/move';
import { MoveToTrash } from '@pages/explorer/components/delete';
import OpenExternally from '@pages/explorer/components/openExternally.tsx';
import type { ReactNode } from 'react';
import ShareButton from '@pages/explorer/components/share/shareButton.tsx';
import AlbumAction from '@pages/explorer/pages/albums/AlbumAction.tsx';
import { EditMarkdownFile } from '@pages/explorer/file/display/displayTypes/markdown/FileMarkdownDisplay.tsx';
import type { FileModelDTO } from '@bindings/FileModelDTO.ts';
import { isValidFileForAlbum, isValidFileForAvatar } from '@models/album.ts';
import { cn } from '@lib/utils.ts';
import SetAsAvatarAction from '@pages/explorer/components/setAsAvatarAction.tsx';

type ActionGroup = {
  items: ReactNode[];
  variant: 'primary' | 'secondary' | 'danger';
  layout: 'inline' | 'stacked';
};

const actions = (
  file: FileModelDTO,
  onClose?: () => void,
  shareUuid?: string,
): ActionGroup[] => {
  const groups: ActionGroup[] = [];

  // Primary quick actions (inline, compact, integrated feel)
  const primaryActions: ReactNode[] = [];

  primaryActions.push(
    <DownloadSingleAction
      key={file.id}
      id={file.id}
      name={file.file_name}
      shareUuid={shareUuid}
    />,
  );

  if (FileTypeActions.canOpenExternal(file)) {
    primaryActions.push(<OpenExternally id={file.id} shareUuid={shareUuid} />);
  }

  if (primaryActions.length > 0) {
    groups.push({
      items: primaryActions,
      variant: 'primary',
      layout: 'inline',
    });
  }

  // Special actions (avatar, album, edit)
  const specialActions: ReactNode[] = [];

  if (isValidFileForAvatar(file)) {
    specialActions.push(
      <SetAsAvatarAction
        file={file}
        onClose={onClose}
        dense
        shareUuid={shareUuid}
      />,
    );
  }

  if (!shareUuid && isValidFileForAlbum(file)) {
    specialActions.push(
      <AlbumAction
        files={[file]}
        onClose={onClose}
        dense
        shareUuid={shareUuid}
      />,
    );
  }

  if (!shareUuid && FileTypeActions.canEditContent(file)) {
    specialActions.push(
      <EditMarkdownFile
        file={file}
        isMarkdown={FileTypeActions.isMarkdown(file)}
        onClose={onClose}
      />,
    );
  }

  if (specialActions.length > 0) {
    groups.push({
      items: specialActions,
      variant: 'secondary',
      layout: 'stacked',
    });
  }

  // File management actions (rename, move, share)
  if (!shareUuid) {
    const managementActions: ReactNode[] = [];

    managementActions.push(
      <RenameAction
        type={'file'}
        id={file.id}
        name={file.file_name}
        onClose={onClose}
      />,
    );

    managementActions.push(
      <MoveAction
        type={'file'}
        name={file.file_name}
        id={file.id}
        current_parent={file.parent_folder_id}
        onClose={onClose}
      />,
    );

    managementActions.push(
      <ShareButton id={file.id} type={'file'} onClose={onClose} />,
    );

    groups.push({
      items: managementActions,
      variant: 'secondary',
      layout: 'stacked',
    });

    // Danger zone (delete)
    groups.push({
      items: [
        <MoveToTrash
          key={file.id}
          short
          id={file.id}
          name={file.file_name}
          onClose={onClose}
        />,
      ],
      variant: 'danger',
      layout: 'stacked',
    });
  }

  return groups;
};

export function FileDisplayActions({
  file,
  onClose,
  shareUuid,
  left,
}: {
  file: FileModelDTO;
  onClose?: () => void;
  shareUuid?: string;
  left?: boolean;
}) {
  const groups = actions(file, onClose, shareUuid);

  const getGroupStyles = (
    variant: 'primary' | 'secondary' | 'danger',
    layout: 'inline' | 'stacked',
  ) => {
    const baseStyles = cn(
      '[&_button]:rounded-md [&_button]:shadow-sm [&_button]:transition-all',
      '[&_button]:grid [&_button]:place-items-center',
    );

    const layoutStyles =
      layout === 'inline'
        ? cn(
            // Inline: compact, horizontal layout
            'justify-between [&_button]:flex [&_button]:flex-row [&_button]:items-center [&_button]:gap-2',
            '[&_button]:px-3 [&_button]:py-2 [&_button]:h-auto [&_button]:w-auto',
            '[&_button>svg]:h-5 [&_button>svg]:w-5',
            '[&_button]:text-sm [&_button]:font-medium',
          )
        : cn(
            // Stacked: larger, icon on top
            '[&_button]:flex [&_button]:flex-col [&_button]:gap-3',
            '[&_button]:p-3 [&_button]:h-22 [&_button]:w-22',
            '[&_button>svg]:h-8 [&_button>svg]:w-8',
            '[&_button]:text-sm [&_button]:font-medium',
          );

    const variantStyles =
      variant === 'primary'
        ? cn(
            '[&_button]:bg-stone-900 [&_button]:text-stone-200 [&_button]:border [&_button]:border-stone-500/30',
            '[&_button:hover]:bg-stone-700 [&_button:hover]:border-stone-500/40 [&_button:hover]:shadow-md',
            'dark:[&_button]:bg-stone-200 dark:[&_button]:text-stone-950 dark:[&_button]:border-stone-500/40',
            'dark:[&_button:hover]:bg-stone-400 dark:[&_button:hover]:border-stone-500/50',
          )
        : variant === 'danger'
          ? cn(
              '[&_button]:bg-red-500/15 [&_button]:border [&_button]:border-red-500/25',
              '[&_button:hover]:bg-red-500/25 [&_button:hover]:border-red-500/35 [&_button:hover]:shadow-md',
              'dark:[&_button]:bg-red-500/20 dark:[&_button]:border-red-500/30',
              'dark:[&_button:hover]:bg-red-500/30 dark:[&_button:hover]:border-red-500/40',
            )
          : cn(
              '[&_button]:bg-stone-200/40 [&_button]:border [&_button]:border-stone-300/50',
              '[&_button:hover]:bg-stone-300/50 [&_button:hover]:border-stone-400/60 [&_button:hover]:shadow-md',
              'dark:[&_button]:bg-stone-700/40 dark:[&_button]:border-stone-600/50',
              'dark:[&_button:hover]:bg-stone-600/50 dark:[&_button:hover]:border-stone-500/60',
            );

    return cn(baseStyles, layoutStyles, variantStyles);
  };

  let itemIndex = 0;

  return (
    <div
      className={cn(
        'my-2! flex flex-wrap gap-4 items-start',
        !left && 'justify-center',
      )}
    >
      {groups.map((group, groupIndex) => (
        <div
          key={`group-${
            // biome-ignore lint/suspicious/noArrayIndexKey: Group index is static
            groupIndex
          }`}
          className={cn(
            'flex flex-wrap gap-2 w-full',
            getGroupStyles(group.variant, group.layout),
          )}
        >
          {group.items.map(item => {
            const currentIndex = itemIndex++;
            return (
              <div
                key={`file-display-action-${currentIndex}`}
                className={'animate-fade-in-left'}
                style={{ animationDelay: `${currentIndex * 50 + 100}ms` }}
              >
                {item}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
