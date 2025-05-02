import { Severity, useNotifications } from '@stores/notificationStore.ts';
import { useMutation } from '@tanstack/react-query';
import { invalidateFilesInFolder, invalidateFolders } from '@lib/query.ts';
import { ButtonForm } from '@pages/explorer/folder/createFolder.tsx';
import { FilePlus2 } from 'lucide-react';
import { api } from '@lib/queries/api.ts';

export function CreateMarkdownFile({
  folder,
  onClose,
}: {
  folder?: string;
  onClose: () => void;
}) {
  const notifications = useNotifications(s => s.actions);

  const { mutate } = useMutation({
    mutationFn: async ({ value }: { value: string }) => {
      const createId = notifications.notify({
        title: 'Create file',
        severity: Severity.INFO,
        loading: true,
      });
      await api
        .post(`auth/file/create/markdown`, {
          name: value,
          parent_folder_id: folder,
        })
        .then(() => {
          invalidateFilesInFolder(folder).then();
          notifications.updateNotification(createId, {
            severity: Severity.SUCCESS,
            status: 'Created',
            timeout: 1000,
          });

          invalidateFolders().then();
          onClose();
        })
        .catch(e => {
          notifications.updateNotification(createId, {
            severity: Severity.ERROR,
            status: 'Error',
            description: e.response?.data?.error || 'Error',
            timeout: 2000,
          });
        });
    },
  });

  return (
    <ButtonForm
      label={'Create Text File'}
      icon={<FilePlus2 />}
      suffix={'.md'}
      onSubmit={value => mutate({ value })}
    />
  );
}
