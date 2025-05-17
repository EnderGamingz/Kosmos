use crate::model::internal::entity_id::EntityId;
use crate::model::profile::ProfileModelDTO;
use crate::response::error_handling::AppError;
use crate::services::session_service::SessionService;
use crate::state::KosmosState;
use axum::extract::{Path, State};
use axum::Json;
use tower_sessions::Session;

pub async fn get_profile_by_user_id(
    State(state): KosmosState,
    session: Session,
    Path(user_id): Path<EntityId>,
) -> Result<Json<ProfileModelDTO>, AppError> {
    SessionService::check_logged_in(&session).await?;

    let profile = state
        .profile_service
        .get_profile_optional(user_id.into())
        .await?;

    match profile {
        None => Err(AppError::NotFound {
            error: "Profile not found".to_string(),
        }),
        Some(p) => Ok(Json(p.into())),
    }
}

pub async fn get_profile_self(
    State(state): KosmosState,
    session: Session,
) -> Result<Json<ProfileModelDTO>, AppError> {
    let user_id = SessionService::check_logged_in(&session).await?;

    let profile = state
        .profile_service
        .get_profile_optional(user_id.into())
        .await?;

    match profile {
        None => Err(AppError::NotFound {
            error: "Profile not found".to_string(),
        }),
        Some(p) => Ok(Json(p.into())),
    }
}
