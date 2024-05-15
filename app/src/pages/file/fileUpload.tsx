import { ArrowUpTrayIcon } from '@heroicons/react/24/solid';
import { ChangeEvent, useEffect, useState } from 'react';
import axios from 'axios';
import { BASE_URL } from '../../vars.ts';
import { queryClient } from '../../main.tsx';
import { useParams } from 'react-router-dom';

export function FileUpload() {
  const { folder } = useParams();

  const [files, setFiles] = useState<FileList | null>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(e.target.files);
    }
  };

  useEffect(() => {
    handleUpload().then(() => {
      setFiles(null);
      queryClient
        .invalidateQueries({
          exact: false,
          queryKey: ['files'],
        })
        .then(() => {
          setFiles(null);
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
        .postForm(`${BASE_URL}auth/file${folder ? `/${folder}` : ''}`, formData)
        .then(res => res.data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <form>
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
