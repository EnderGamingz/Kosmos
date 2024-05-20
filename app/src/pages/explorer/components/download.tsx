import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { BASE_URL } from '../../../vars.ts';

export function DownloadSingleAction({
  type,
  id,
  name,
}: {
  type: 'file' | 'folder';
  id: string;
  name: string;
}) {
  const downloadAction = useMutation({
    mutationFn: async () => {
      const response = await axios.get(
        `${BASE_URL}auth/download/${type}/${id}`,
        { responseType: 'blob' },
      );

      if (response.status === 200) {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', name);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    },
  });

  return (
    <button
      onClick={() => downloadAction.mutate()}
      disabled={downloadAction.isPending}>
      Download Single
    </button>
  );
}
