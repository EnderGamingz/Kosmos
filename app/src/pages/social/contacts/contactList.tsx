import { ContactQuery } from '@lib/queries/contactQuery.ts';
import type { ProfileContactModelDTO } from '@bindings/ProfileContactModelDTO.ts';
import UserAvatar from '@components/UserAvatar.tsx';
import { ContactActionMenu } from '@pages/social/contacts/actions/contactActionMenu.tsx';
import { cn } from '@lib/utils.ts';
import { AnimatePresence, motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { MessageSquareShare } from 'lucide-react';

export function ContactList() {
  const { data } = ContactQuery.useProfilesSuspense();

  return (
    <div className={cn(data.length === 0 && 'opacity-40')}>
      <h2 className={'text-xl animate-fade-in-top delay-200'}>
        My Contacts{' '}
        <span className={'text-sm text-muted-foreground'}>({data.length})</span>
      </h2>
      <ul className={'space-y-2 mt-2 animate-fade-in-top delay-300'}>
        <AnimatePresence>
          {data.map(profile => (
            <ContactListItem key={profile.user_id} profile={profile} />
          ))}
        </AnimatePresence>
      </ul>
    </div>
  );
}

function ContactListItem({ profile }: { profile: ProfileContactModelDTO }) {
  return (
    <motion.li
      layout
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
    >
      <div
        className={
          'flex gap-2 p-2 rounded-md transition-colors hover:bg-border'
        }
      >
        <UserAvatar
          userId={profile.user_id}
          username={profile.username}
          className={'w-14 h-14'}
        />
        <div>
          <p className={'text-lg'}>{profile.full_name ?? profile.username}</p>
          {profile.email && (
            <p className={'text-muted-foreground text-sm'}>{profile.email}</p>
          )}
        </div>
        <div className={'ml-auto flex gap-2 items-start'}>
          <Link to={`/social/chats/user/${profile.user_id}`}>
            <MessageSquareShare className={'w-6 h-6'} />
          </Link>
          <ContactActionMenu profile={profile} />
        </div>
      </div>
    </motion.li>
  );
}
