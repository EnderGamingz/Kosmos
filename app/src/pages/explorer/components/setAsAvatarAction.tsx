import { FileModelDTO } from '@bindings/FileModelDTO.ts';
import { useContext } from 'react';
import { DisplayContext } from '@lib/contexts.ts';
import { isValidFileForAvatar } from '@models/album.ts';
import { useMutation } from '@tanstack/react-query';
import { useUserState } from '@stores/userStore.ts';
import { UserCircle } from 'lucide-react';
import { api } from '@lib/queries/api.ts';

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
      api.patch(`auth/user/avatar`, {
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
    <button onClick={handleClick}>
      <UserCircle />
      {dense ? 'Set Avatar' : 'Set as Avatar'}
    </button>
  );
}
