import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { BASE_URL } from '../../../vars.ts';
import { ChangeEvent, FormEvent, useMemo, useState } from 'react';
import { invalidateFiles } from '../../../lib/query.ts';
import { DeleteAction } from '../components/delete.tsx';
import { MoveAction } from '../components/move.tsx';
import {
  FileModel,
  FileType,
  getFileTypeById,
} from '../../../../models/file.ts';
import { DownloadSingleAction } from '../components/download.tsx';
import cx from 'classnames';

export function FileItem({
  file,
  selected,
  onSelect,
}: {
  file: FileModel;
  selected: string[];
  onSelect: (id: string) => void;
}) {
  const [fileName, setFileName] = useState(file.file_name);

  const isSelected = useMemo(() => selected.includes(file.id), [selected]);

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
    <li
      className={cx(
        'flex items-center justify-between',
        isSelected && 'bg-indigo-100',
      )}>
      <input
        type={'checkbox'}
        checked={isSelected}
        onChange={() => onSelect(file.id)}
      />
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
