use crate::model::internal::entity_id::EntityId;
use crate::response::error_handling::AppError;
use crate::response::success_handling::{AppSuccess, ResponseResult};
use crate::services::session_service::SessionService;
use crate::state::KosmosState;
use axum::extract::{Path, State};
use axum::Json;
use serde::Deserialize;
use tower_sessions::Session;

#[derive(Deserialize)]
pub struct InviteToGroupDTO {
    pub user_id: EntityId,
}

pub async fn invite_user_to_group_chat(
    State(state): KosmosState,
    session: Session,
    Path(chat_id): Path<i64>,
    Json(payload): Json<InviteToGroupDTO>,
) -> ResponseResult {
    let user_id = SessionService::check_logged_in(&session).await?;

    let chat = state
        .contact_service
        .chat_service
        .get_group_chat_optional_from_user(user_id, chat_id)
        .await?
        .ok_or_else(|| AppError::NotFound {
            error: "Chat not found".to_string(),
        })?;

    let are_contacts = state
        .contact_service
        .check_users_are_contacts(user_id, payload.user_id.into())
        .await?;

    if !are_contacts {
        return Err(AppError::BadRequest {
            error: Some("User is not a contact".to_string()),
        });
    }

    state
        .contact_service
        .chat_service
        .add_chat_member(chat.id, payload.user_id.into())
        .await?;

    Ok(AppSuccess::UPDATED)
}
