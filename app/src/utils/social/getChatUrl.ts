export function getChatUrl(
  isPersonalChat: boolean,
  chatId: string,
  userId: string,
) {
  if (isPersonalChat) {
    return `/social/chats/user/${userId}`;
  } else {
    return `/social/chats/group/${chatId}`;
  }
}
