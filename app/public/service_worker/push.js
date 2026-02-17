self.addEventListener('push', onPush);

async function onPush(event) {
  if (event.data) {
    const data = event.data.json();
    console.log(data);
    const action = data.action;

    let title = 'Action';
    let body = 'An action has been performed';
    let click = null;
    let actions = [];
    let tag = new Date().toISOString();

    if ('NewChatMessage' in action) {
      const name =
        action.NewChatMessage.content.author.full_name ??
        action.NewChatMessage.content.author.username;

      const prefix =
        action.NewChatMessage.chat_type === 'Group'
          ? 'Group message from '
          : 'Message from ';
      title = prefix + name;
      body = action.NewChatMessage.content.content;
      click = `https://kosmos.setilic.com/social/chats/${action.NewChatMessage.chat_type === 'Group' ? 'group' : 'user'}/${action.NewChatMessage.chat_id}`;
      actions = [
        {
          action: 'explore',
          title: 'Open chat',
        },
        {
          action: 'close',
          title: 'Close',
        },
      ];
      tag = `message-${action.NewChatMessage.chat_id}`;
    }

    if ('ChatUpdate' in action) {
      title = 'A chat got updated';
      click = `https://kosmos.setilic.com/social/chats/${action.ChatUpdate.chat_type === 'Group' ? 'group' : 'user'}/${action.ChatUpdate.chat_id}`;
      actions = [
        {
          action: 'explore',
          title: 'Open chat',
        },
        {
          action: 'close',
          title: 'Close',
        },
      ];
      tag = `chat-${action.ChatUpdate.chat_id}`;
    }

    // Send the push data to the application
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage(data);
    });

    event
      .waitUntil(
        self.registration.showNotification(title, {
          body,
          actions,
          icon: '/img/logo_filled_full.svg',
          data: {
            tag,
            clickActionUrl: click,
          },
          tag,
        }),
      )
      .then()
      .catch();
  }
}

-self.addEventListener('notificationclick', event => {
  const notification = event.notification;
  const action = event.action;

  if (action === 'close') {
    notification.close();
  } else {
    self.clients.openWindow(event.notification.data.clickActionUrl);
    notification.close();
  }
});
