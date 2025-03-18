import { useChatContext } from '@pages/social/chats/context.tsx';
import { useMemo } from 'react';
import UserAvatar from '@components/UserAvatar.tsx';

export function ChatHeader() {
  const { chat, getPartner } = useChatContext();
  const partner = useMemo(getPartner, [getPartner, chat]);

  return (
    <div
      className={
        'flex items-center gap-2 bg-popover/70 backdrop-blur-lg p-2 rounded-full animate-fade-in shadow'
      }>
      {partner && (
        <div className={'animate-fade-in-left delay-100'}>
          <UserAvatar
            disabled={!partner.has_avatar}
            userId={partner.user_id}
            username={partner.username}
            className={'w-8 h-8'}
          />
        </div>
      )}
      <p className={'text-xl animate-fade-in-left delay-200'}>{chat.name}</p>
      <div className={'ml-auto mr-3'}>
        {!partner && (
          <p className={'text-sm text-muted-foreground'}>
            {chat.members.length} members
          </p>
        )}
      </div>
    </div>
  );
}
