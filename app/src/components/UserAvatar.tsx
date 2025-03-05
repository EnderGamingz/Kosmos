import { Avatar, AvatarFallback, AvatarImage } from '@components/ui/avatar.tsx';
import { MinidentIcon } from '@components/MinidentIcon.tsx';
import { getAvatarUrl } from '@utils/user.ts';
import { cn } from '@lib/utils.ts';

export default function UserAvatar({
  userId,
  fetchedAt,
  username,
  className,
}: {
  userId?: string;
  fetchedAt?: unknown;
  username?: string;
  className?: string;
}) {
  return (
    <Avatar
      className={cn(
        'isolate relative after:content-["_"] after:absolute after:inset-0 after:z-10 after:rounded-full after:inset-shadow-sm',
        className,
      )}>
      {userId && (
        <AvatarImage
          className={'object-cover'}
          src={getAvatarUrl(userId, fetchedAt)}
          alt={username}
        />
      )}
      {username && (
        <AvatarFallback>
          <MinidentIcon username={username} />
        </AvatarFallback>
      )}
    </Avatar>
  );
}
