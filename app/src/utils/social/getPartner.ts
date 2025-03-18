import { ChatModelDTO } from '@bindings/ChatModelDTO.ts';
import { UserModelDTO } from '@bindings/UserModelDTO.ts';

export function getPartner(
  isPersonalChat: boolean,
  chat: ChatModelDTO,
  user: UserModelDTO,
) {
  return () => {
    if (!isPersonalChat) throw new Error('Cannot get partner of group chat');
    return chat.members.find(u => u.user_id !== user.id);
  };
}
