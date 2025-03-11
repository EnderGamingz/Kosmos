import { ContactQuery } from '@/lib/queries/contactQuery';
import UserAvatar from '@components/UserAvatar.tsx';
import { ProfileContactModelDTO } from '@bindings/ProfileContactModelDTO.ts';

export default function ContactsPage() {
  const { data: profiles } = ContactQuery.useProfilesSuspense();

  return (
    <div className={'space-y-4'}>
      <h1 className={'text-3xl animate-fade-in-top'}>Contacts</h1>
      <h2 className={'text-xl animate-fade-in-top delay-200'}>
        {profiles.length} contacts
      </h2>
      <ul className={'space-y-2 mt-2'}>
        {profiles.map(profile => (
          <ContactListItem key={profile.user_id} profile={profile} />
        ))}
      </ul>
    </div>
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
