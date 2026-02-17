import UserAvatar from '@components/UserAvatar.tsx';
import { useUserState } from '@stores/userStore.ts';
import { Link } from 'react-router-dom';
import { Button, buttonVariants } from '@components/ui/button.tsx';
import { ArrowUpRight } from 'lucide-react';
import { ProfileQuery } from '@lib/queries/profileQuery.ts';
import { useNotifications } from '@stores/notificationStore.ts';
import { SettingsSubtitle } from '@pages/settings/settingsTitle.tsx';

export default function ProfilePictureSettings() {
  const { user, fetchUser } = useUserState(s => s);

  const notifications = useNotifications(s => s.actions);
  const remove = ProfileQuery.useRemoveAvatarMutation(notifications, () => {
    fetchUser({ background: true });
  });
  if (!user) return null;

  return (
    <section className={'space-y-3'}>
      <SettingsSubtitle title={'Avatar'} />
      <div className={'flex gap-5 max-sm:flex-col items-center'}>
        <UserAvatar
          userId={user.id}
          username={user.username}
          fetchedAt={user.fetched_at}
          disabled={!user.has_avatar}
          className={
            'w-32 h-32 ring ring-primary/50 ring-offset-4 shadow-lg animate-fade-in-left delay-50'
          }
        />
        <div className={'space-y-2'}>
          <p
            className={
              'text-muted-foreground whitespace-pre-wrap animate-fade-in-top delay-100'
            }
          >
            {user.has_avatar
              ? "Your avatar is set by a file you've uploaded."
              : "You don't have an avatar set yet. \nBrowse your files and select and image for your avatar."}
          </p>
          <div
            className={'flex flex-wrap gap-2 animate-fade-in-left delay-200'}
          >
            {user.has_avatar && (
              <Button
                variant={'outline'}
                onClick={() => remove.mutate()}
                disabled={remove.isPending}
              >
                Remove Avatar
              </Button>
            )}
            <Link to={'/home'} className={buttonVariants()}>
              Browse Files
              <ArrowUpRight />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
