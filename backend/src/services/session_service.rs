use tower_sessions::Session;

use crate::response::error_handling::AppError;

#[derive(Clone)]
pub struct SessionService;

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
    pub async fn get_session_id(session: &Session) -> Option<String> {
        let id = session.get::<String>("user_id").await;

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
    pub async fn check_logged_in(session: &Session) -> Result<String, AppError> {
        let id = SessionService::get_session_id(session).await;
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
}
