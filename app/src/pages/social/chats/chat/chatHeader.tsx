import { useChatContext } from '@pages/social/chats/context.tsx';
import { useMemo } from 'react';
import UserAvatar from '@components/UserAvatar.tsx';
import { cn } from '@lib/utils.ts';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@components/ui/drawer.tsx';
import { ChatModelDTO } from '@bindings/ChatModelDTO.ts';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { LeaveGroupButton } from '@pages/social/chats/chat/leaveGroupButton.tsx';
import { InviteUserButton } from '@pages/social/chats/chat/inviteUserButton.tsx';

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
      <p
        className={cn(
          'text-xl animate-fade-in-left delay-200',
          !partner && 'ml-2',
        )}>
        {chat.name}
      </p>
      <div className={'ml-auto mr-3'}>
        {!partner && <ChatMembers chat={chat} />}
      </div>
    </div>
  );
}

function ChatMembers({ chat }: { chat: ChatModelDTO }) {
  return (
    <Drawer direction={'right'}>
      <DrawerTrigger asChild>
        <button
          className={'text-sm text-muted-foreground underline cursor-pointer'}>
          {chat.members.length} member{chat.members.length > 1 ? 's' : ''}
        </button>
      </DrawerTrigger>
      <DrawerContent className={'rounded-l-lg'}>
        <DrawerHeader className={'flex flex-row justify-between'}>
          <div>
            <DrawerTitle className={'text-2xl'}>{chat.name}</DrawerTitle>
            <DrawerDescription>
              {chat.members.length} member
              {chat.members.length > 1 ? 's' : ''}
            </DrawerDescription>
          </div>
          <InviteUserButton />
        </DrawerHeader>
        <ul className={'px-3'}>
          {chat.members.map(member => (
            <li key={member.user_id} className={'flex items-center gap-2 p-2'}>
              <UserAvatar
                disabled={!member.has_avatar}
                userId={member.user_id}
                username={member.username}
                className={'w-8 h-8'}
              />
              <p>{member.full_name ?? member.username}</p>
            </li>
          ))}
        </ul>
        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant={'outline'}>
              <X />
              Close
            </Button>
          </DrawerClose>
          <LeaveGroupButton />
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
