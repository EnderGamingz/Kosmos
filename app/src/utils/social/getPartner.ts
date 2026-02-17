import type { ChatModelDTO } from '@bindings/ChatModelDTO.ts';
import type { UserModelDTO } from '@bindings/UserModelDTO.ts';

export function getPartner(
  isPersonalChat: boolean,
  chat: ChatModelDTO,
  user: UserModelDTO,
) {
  if (!isPersonalChat) return undefined;
  return chat.members.find(u => u.user_id !== user.id);
}
