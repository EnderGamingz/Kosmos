use crate::model::chat::chat::ChatModelDTO;
use crate::response::error_handling::AppError;
use crate::routes::api::v1::auth::chat::utils;
use crate::services::session_service::SessionService;
use crate::state::KosmosState;
use axum::extract::{Path, State};
use axum::Json;
use axum_valid::Valid;
use serde::Deserialize;
use tower_sessions::Session;
use validator::Validate;

pub async fn get_create_personal_chat(
    State(state): KosmosState,
    session: Session,
    Path(other_user_id): Path<i64>,
) -> Result<Json<ChatModelDTO>, AppError> {
    let user_id = SessionService::check_logged_in(&session).await?;

    if user_id == other_user_id {
        return Err(AppError::BadRequest {
            error: Some("Cannot create a chat with yourself".to_string()),
        });
    }

    let are_contact = state
        .contact_service
        .check_users_are_contacts(user_id, other_user_id)
        .await?;

    if !are_contact {
        return Err(AppError::BadRequest {
            error: Some("Cannot create a chat with a stranger".to_string()),
        });
    }

    let chat = state
        .contact_service
        .chat_service
        .get_personal_chat_optional(user_id, other_user_id)
        .await?;

    let chat = match chat {
        Some(existing) => existing,
        None => {
            state
                .contact_service
                .chat_service
                .create_personal_chat(user_id, other_user_id)
                .await?
        }
    };

    let members = utils::get_chat_members_dto(&state, chat.clone()).await?;
    let chat = chat.to_personal_chat_dto(user_id, members);
    Ok(Json(chat))
}

#[derive(Deserialize, Validate, Debug)]
pub struct CreateGroupChatDTO {
    #[validate(length(min = 1, max = 100))]
    pub name: String,
}

pub async fn create_group_chat(
    State(state): KosmosState,
    session: Session,
    Valid(Json(payload)): Valid<Json<CreateGroupChatDTO>>,
) -> Result<Json<ChatModelDTO>, AppError> {
    let user_id = SessionService::check_logged_in(&session).await?;

    let chat = state
        .contact_service
        .chat_service
        .create_group_chat(payload.name, user_id)
        .await?;

    let members = utils::get_chat_members_dto(&state, chat.clone()).await?;
    let chat = chat.to_group_chat_dto(members);
    Ok(Json(chat))
}
