import { ContactQuery } from '@lib/queries/contactQuery.ts';
import { ProfileContactModelDTO } from '@bindings/ProfileContactModelDTO.ts';
import UserAvatar from '@components/UserAvatar.tsx';

export function ContactList() {
  const { data: profiles } = ContactQuery.useProfilesSuspense();

  return (
    <>
      <h2 className={'text-xl animate-fade-in-top delay-200'}>
        My Contact{profiles.length !== 1 && 's'}{' '}
        <span className={'text-sm text-muted-foreground'}>
          ({profiles.length})
        </span>
      </h2>
      <ul className={'space-y-2 mt-2 animate-fade-in-top delay-300'}>
        {profiles.map(profile => (
          <ContactListItem key={profile.user_id} profile={profile} />
        ))}
      </ul>
    </>
  );
}

function ContactListItem({ profile }: { profile: ProfileContactModelDTO }) {
  return (
    <li
      className={'flex gap-2 p-2 rounded-md transition-colors hover:bg-border'}>
      <UserAvatar
        userId={profile.user_id}
        username={profile.username}
        className={'w-14 h-14'}
      />
      <div>
        <p>{profile.full_name ?? profile.username}</p>
        {profile.email && <p>{profile.email}</p>}
      </div>
    </li>
  );
}
