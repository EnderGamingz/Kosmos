import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { BASE_URL } from '../../../vars.ts';
import { ChangeEvent, FormEvent, useState } from 'react';
import { invalidateFiles } from '../../../lib/query.ts';
import { DeleteAction } from '../components/delete.tsx';
import { MoveAction } from '../components/move.tsx';
import {
  FileModel,
  FileType,
  getFileTypeById,
} from '../../../../models/file.ts';
import { DownloadSingleAction } from '../components/download.tsx';

export function FileItem({ file }: { file: FileModel }) {
  const [fileName, setFileName] = useState(file.file_name);

  const renameAction = useMutation({
    mutationFn: () =>
      axios.patch(`${BASE_URL}auth/file/${file.id}`, {
        name: fileName,
      }),
    onSuccess: invalidateFiles,
  });

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    setFileName(e.target.value);
  }

  function handleNameSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    renameAction.mutate();
  }

  return (
    <li className={'flex items-center justify-between'}>
      {[FileType.Image, FileType.RawImage].some(
        x => x === getFileTypeById(file.file_type),
      ) && (
        <img
          className={'aspect-square h-20 object-cover'}
          src={`${BASE_URL}auth/file/image/${file.id}/0`}
          alt={file.file_name}
        />
      )}
      <form onSubmit={handleNameSubmit}>
        <input
          disabled={renameAction.isPending}
          className={'overflow-ellipsis bg-transparent'}
          onChange={handleChange}
          value={fileName}
        />
      </form>
      <div>
        <DownloadSingleAction
          type={'file'}
          id={file.id}
          name={file.file_name}
        />
        <DeleteAction type={'file'} id={file.id} />
        <MoveAction type={'file'} id={file.id} destination={null} />
      </div>
    </li>
  );
}
