import { ArrowUpTrayIcon } from '@heroicons/react/24/solid';
import { ChangeEvent, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { BASE_URL } from '../../../vars.ts';
import { useParams } from 'react-router-dom';
import { queryClient } from '../../../lib/query.ts';
import {
  Severity,
  useNotifications,
} from '../../../stores/notificationStore.ts';

export function FileUpload() {
  const { folder } = useParams();
  const formRef = useRef<HTMLFormElement>(null);
  const notification = useNotifications(s => s.actions);

  const [files, setFiles] = useState<FileList | null>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(e.target.files);
    }
  };

  useEffect(() => {
    handleUpload().then(async () => {
      setFiles(null);
      formRef.current?.reset();
      await queryClient.invalidateQueries({
        exact: false,
        queryKey: ['files'],
      });
    });
  }, [files]);

  const handleUpload = async () => {
    if (!files) return;

    const formData = new FormData();
    for (const file of files) {
      formData.append('file', file);
    }

    try {
      await axios
        .postForm(
          `${BASE_URL}auth/file/upload${folder ? `/${folder}` : ''}`,
          formData,
        )
        .then(res => {
          notification.notify({
            id: new Date().toISOString(),
            timeout: 2000,
            title: 'Upload complete',
            description: `Uploaded ${files.length} files`,
            severity: Severity.SUCCESS,
          });
          return res.data;
        });
    } catch (error) {
      notification.notify({
        id: new Date().toISOString(),
        severity: Severity.ERROR,
        title: 'Upload error',
        description: 'Check console for more information',
      });
    }
  };

  return (
    <form ref={formRef}>
      <input
        type={'file'}
        name={'file'}
        id={'file'}
        multiple
        className={'hidden'}
        onChange={handleFileChange}
      />
      <label
        htmlFor='file'
        className={
          'flex cursor-pointer items-center gap-1 rounded-md bg-blue-400 px-4 py-2'
        }>
        <ArrowUpTrayIcon className={'h-5 w-5'} /> Upload
      </label>
    </form>
  );
}
