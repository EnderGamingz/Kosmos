use axum::body::Bytes;
use axum::extract::ws::{Message, WebSocket};

pub async fn socket_ping(socket: &mut WebSocket) -> Result<(), ()> {
    if socket
        .send(Message::Ping(Vec::from(Bytes::from_static(&[1, 2, 3]))))
        .await
        .is_ok()
    {
        Ok(())
    } else {
        Err(())
    }
}
