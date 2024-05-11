use tower_sessions::cookie::time::Duration;
use tower_sessions::{Expiry, MemoryStore, SessionManagerLayer};

pub type KosmosSession = SessionManagerLayer<MemoryStore>;

pub fn init() -> KosmosSession {
    let store = MemoryStore::default();

    let session_layer = SessionManagerLayer::new(store)
        .with_secure(false)
        .with_expiry(Expiry::OnInactivity(Duration::days(30)));
    session_layer
}
