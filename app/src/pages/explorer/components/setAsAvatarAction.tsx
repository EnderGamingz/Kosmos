import { FileModelDTO } from '@bindings/FileModelDTO.ts';
import { useContext } from 'react';
import { DisplayContext } from '@lib/contexts.ts';
import { isValidFileForAvatar } from '@models/album.ts';
import { Aperture } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { BASE_URL } from '@lib/env.ts';
import { useUserState } from '@stores/userStore.ts';

export default function SetAsAvatarAction({
  file,
  onClose,
  dense,
  shareUuid,
}: {
  file: FileModelDTO;
  onClose?: () => void;
  dense?: boolean;
  shareUuid?: string;
}) {
  const context = useContext(DisplayContext);
  const fetchUser = useUserState(s => s.fetchUser);

  const setAction = useMutation({
    mutationFn: () =>
      axios.post(`${BASE_URL}auth/user/avatar`, {
        file_id: file.id,
      }),
    onSuccess: () => fetchUser({ background: true }),
  });

  if (context.shareUuid || shareUuid) return null;
  if (!isValidFileForAvatar(file)) return null;

  const handleClick = () => {
    setAction.mutate();
    onClose?.();
  };

  return (
    <>
      <button onClick={handleClick}>
        <Aperture />
        {dense ? 'Avatar' : 'Set as Avatar'}
      </button>
      {!dense && <hr className={'border-stone-300 dark:border-stone-500'} />}
    </>
  );
}
