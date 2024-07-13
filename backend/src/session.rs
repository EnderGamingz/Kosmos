use tower_sessions::{Expiry, MemoryStore, SessionManagerLayer};
use tower_sessions::cookie::time::Duration;
use crate::constants::SESSION_NAME;

pub type KosmosSession = SessionManagerLayer<MemoryStore>;

pub fn init() -> KosmosSession {
    let store = MemoryStore::default();

    let session_layer = SessionManagerLayer::new(store)
        .with_name(SESSION_NAME)
        .with_secure(false)
        .with_expiry(Expiry::OnInactivity(Duration::days(30)));

    session_layer
}
