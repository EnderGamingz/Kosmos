import { NotificationActions, Severity } from '@stores/notificationStore.ts';
import { BytesFormatter } from '@utils/fileSize.ts';
import { BASE_URL } from '@lib/env.ts';
import axios from 'axios';

export const quickShareUploadFn = async ({
  files,
  password,
  expiresAt,
  limit,
  notifications,
  byteFormatter,
}: {
  files: File[];
  password?: string;
  expiresAt?: string;
  limit?: number;
  notifications: NotificationActions;
  byteFormatter: BytesFormatter;
}) => {
  const formData = new FormData();
  for (const file of files) {
    formData.append('file', file);
  }

  const uploadId = notifications.notify({
    title: 'Quick share',
    loading: true,
    status: `${files.length} files uploading...`,
    severity: Severity.INFO,
    canDismiss: false,
  });

  const url = new URL(`${BASE_URL}auth/file/upload`);
  url.searchParams.set('is_quick_share', 'true');
  if (password) url.searchParams.set('password', password);
  if (expiresAt) url.searchParams.set('expires_at', expiresAt);
  if (limit) url.searchParams.set('limit', limit.toString());

  // noinspection JSUnusedGlobalSymbols
  return axios
    .postForm(url.toString(), formData, {
      onUploadProgress: ({ loaded, total }) => {
        notifications.updateNotification(uploadId, {
          description: `${byteFormatter.formatBytes(loaded)} / ${total ? byteFormatter.formatBytes(total) : 'Unknown'}`,
        });
      },
    })
    .then(res => {
      notifications.updateNotification(uploadId, {
        timeout: 2000,
        status: 'Complete',
        description: `${files.length} files uploaded`,
        severity: Severity.SUCCESS,
        canDismiss: true,
      });
      return res.data;
    })
    .catch(err => {
      notifications.updateNotification(uploadId, {
        status: 'Failed',
        description: err.response?.data?.error || 'Error',
        severity: Severity.ERROR,
        canDismiss: true,
      });
    });
};
