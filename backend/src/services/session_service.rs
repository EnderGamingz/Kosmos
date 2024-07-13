use crate::constants::SESSION_USER_ID_KEY;
use crate::response::error_handling::AppError;
use tower_sessions::Session;

#[derive(Clone)]
pub struct SessionService;

pub type UserId = i64;

impl SessionService {
    /// Asynchronously retrieves the user ID from the session.
    ///
    /// # Arguments
    ///
    /// * `session` - A reference to the session from which to retrieve the user ID.
    ///
    /// # Returns
    ///
    /// Returns an `Option<String>` representing the user ID if it exists in the session, otherwise returns `None`.
    ///
    pub async fn get_user_id(session: &Session) -> Option<UserId> {
        let id = session.get::<UserId>(SESSION_USER_ID_KEY).await;

        id.unwrap_or_else(|_| None)
    }

    /// Asynchronously checks if a user is logged in based on the session.
    ///
    /// # Arguments
    ///
    /// * `session` - A reference to the session to check for logged-in status.
    ///
    /// # Returns
    ///
    /// Returns a `Result` containing the user ID if the user is logged in, otherwise returns an `AppError::NotLoggedIn` error.
    ///
    /// # Errors
    ///
    /// Returns an `AppError::NotLoggedIn` error if the user is not logged in.
    ///
    pub async fn check_logged_in(session: &Session) -> Result<UserId, AppError> {
        let id = SessionService::get_user_id(session).await;
        match id {
            Some(user) => Ok(user),
            None => return Err(AppError::NotLoggedIn)?,
        }
    }

    /// Asynchronously flushes the session, removing all data associated with it.
    ///
    /// # Arguments
    ///
    /// * `session` - A reference to the session to flush.
    ///
    /// # Remarks
    ///
    /// This function removes all data associated with the session, effectively logging the user out.
    ///
    pub async fn flush_session(session: &Session) {
        session.flush().await.unwrap();
    }

    pub async fn grant_share_access(session: &Session, share_uuid: &String) {
        session.insert(share_uuid, "true").await.unwrap();
    }

    pub async fn revoke_share_access(session: &Session, share_uuid: &String) {
        session.remove::<String>(share_uuid).await.unwrap();
    }

    pub async fn check_share_access(session: &Session, share_uuid: &String) -> bool {
        match session.get::<String>(share_uuid).await {
            Ok(t) => t.is_some(),
            Err(_) => false,
        }
    }
}
