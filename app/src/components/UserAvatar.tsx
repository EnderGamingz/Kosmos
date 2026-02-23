import { Avatar, AvatarFallback, AvatarImage } from '@components/ui/avatar.tsx';
import { getAvatarUrl } from '@utils/user.ts';
import { cn } from '@lib/utils.ts';
import { UserInitialsAvatar } from '@components/UserInitialsAvatar.tsx';

export default function UserAvatar({
  userId,
  fetchedAt,
  username,
  className,
  disabled,
}: {
  userId?: string;
  fetchedAt?: unknown;
  username?: string;
  className?: string;
  disabled?: boolean;
}) {
  return (
    <Avatar
      className={cn(
        'isolate relative after:content-["_"] after:absolute after:inset-0 after:z-10 after:rounded-full after:inset-shadow-sm',
        className,
      )}
    >
      {userId && !disabled && (
        <AvatarImage
          className={'object-cover'}
          src={getAvatarUrl(userId, fetchedAt)}
          alt={username}
        />
      )}
      {username && (
        <AvatarFallback>
          <UserInitialsAvatar username={username} />
        </AvatarFallback>
      )}
    </Avatar>
  );
}
