use crate::constants::SESSION_USER_ID_KEY;
use crate::response::error_handling::AppError;
use tower_sessions::Session;
use webauthn_rs::prelude::{DiscoverableAuthentication, PasskeyRegistration};

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


    pub async fn grant_share_access(session: &Session, share_uuid: &String) {
        session.insert(share_uuid, "true").await.unwrap();
    }

    pub async fn check_share_access(session: &Session, share_uuid: &String) -> bool {
        match session.get::<String>(share_uuid).await {
            Ok(t) => t.is_some(),
            Err(_) => false,
        }
    }

    pub async fn set_passkey_register(session: &Session, state: PasskeyRegistration, name: String) {
        session.insert("pass_reg_state", state).await.unwrap();
        session.insert("pass_reg_name", name).await.unwrap();
    }

    pub async fn get_passkey_register(
        session: &Session,
    ) -> Result<(PasskeyRegistration, String), AppError> {
        let state = session
            .get::<PasskeyRegistration>("pass_reg_state")
            .await
            .unwrap();

        let name = session.get::<String>("pass_reg_name").await.unwrap();

        match state {
            None => Err(AppError::BadRequest {
                error: Some("Passkey registration state not found".to_string()),
            }),
            Some(state) => Ok((state, name.unwrap_or("Passkey".to_string()))),
        }
    }

    pub async fn clear_passkey_register(session: &Session) {
        session
            .remove::<PasskeyRegistration>("pass_reg_state")
            .await
            .unwrap();
        session.remove::<String>("pass_reg_name").await.unwrap();
    }

    pub async fn set_passkey_authentication(session: &Session, state: DiscoverableAuthentication) {
        session.insert("pass_auth_state", state).await.unwrap();
    }

    pub async fn get_passkey_authentication(
        session: &Session,
    ) -> Result<DiscoverableAuthentication, AppError> {
        let state = session
            .get::<DiscoverableAuthentication>("pass_auth_state")
            .await
            .unwrap();

        match state {
            None => Err(AppError::BadRequest {
                error: Some("Passkey authentication state not found".to_string()),
            }),
            Some(state) => Ok(state),
        }
    }

    pub async fn clear_passkey_authentication(session: &Session) {
        session
            .remove::<DiscoverableAuthentication>("pass_auth_state")
            .await
            .unwrap();
    }
}
