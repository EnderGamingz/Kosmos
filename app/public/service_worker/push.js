self.addEventListener('push', onPush);

async function onPush(event) {
  if (event.data) {
    const data = event.data.json();
    console.log(data);
    const action = data.action;

    let title = 'Action';
    let body = 'An action has been performed';

    if ('NewChatMessage' in action) {
      let name =
        action.NewChatMessage.content.author.full_name ??
        action.NewChatMessage.content.author.username;

      const prefix =
        action.NewChatMessage.chat_type === 'Group'
          ? 'Group message from '
          : 'Message from ';
      title = prefix + name;
      body = action.NewChatMessage.content.content;
    }

    if ('ChatUpdate' in action) {
      title = 'A chat got updated';
    }

    // Send the push data to the application
    const clients = await self.clients.matchAll();
    clients.forEach(client => client.postMessage(data));

    await event
      .waitUntil(
        self.registration.showNotification(title, {
          body,
        }),
      )
      .catch();
  }
}
