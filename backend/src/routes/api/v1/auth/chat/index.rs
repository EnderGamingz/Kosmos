use crate::model::chat::chat::ChatModelDTO;
use crate::model::internal::chat_type::ChatType;
use crate::response::error_handling::AppError;
use crate::services::chat_service::ChatService;
use crate::services::session_service::SessionService;
use crate::state::KosmosState;
use axum::extract::{Path, Query, State};
use axum::Json;
use serde::Deserialize;
use tower_sessions::Session;
use validator::Validate;
use crate::routes::api::v1::auth::chat::utils;

#[derive(Deserialize, Validate, Debug)]
pub struct GetChatsQueryDTO {
    #[serde(default = "get_default_chats_limit")]
    #[validate(range(min = 1, max = 500))]
    pub limit: i64,

    #[serde(default = "get_default_page")]
    #[validate(range(min = 0))]
    pub page: i64,
}

fn get_default_chats_limit() -> i64 {
    50
}

fn get_default_page() -> i64 {
    0
}

pub async fn get_chats(
    State(state): KosmosState,
    session: Session,
    Query(params): Query<GetChatsQueryDTO>,
) -> Result<Json<Vec<ChatModelDTO>>, AppError> {
    let user_id = SessionService::check_logged_in(&session).await?;

    let chat = state
        .contact_service
        .chat_service
        .get_chats(user_id, &params)
        .await?;

    let chat_ids = chat.iter().map(|c| c.id).collect();

    let members = state
        .contact_service
        .chat_service
        .get_chat_members_by_chat_ids(chat_ids)
        .await?;

    let all_member_ids = members.clone().into_iter().map(|c| c.user_id).collect();

    let all_member_profiles = state
        .contact_service
        .chat_service
        .get_chat_members_profiles(all_member_ids)
        .await?;
    let all_members = ChatService::zip_chat_members_profiles(members, all_member_profiles);

    let mut chats = Vec::new();
    for chat in chat {
        let members = all_members
            .iter()
            .filter(|m| m.chat_id == chat.id.to_string())
            .cloned()
            .collect();

        let chat = match chat.chat_type {
            ChatType::Personal => chat.to_personal_chat_dto(user_id, members),
            _ => chat.to_dto(members),
        };

        chats.push(chat);
    }

    Ok(Json(chats))
}

pub async fn get_group_chat(
    State(state): KosmosState,
    session: Session,
    Path(chat_id): Path<i64>,
) -> Result<Json<ChatModelDTO>, AppError> {
    let user_id = SessionService::check_logged_in(&session).await?;

    let chat = state
        .contact_service
        .chat_service
        .get_group_chat_optional_from_user(user_id, chat_id)
        .await?
        .ok_or_else(|| AppError::BadRequest {
            error: Some("Chat not found".to_string()),
        })?;

    let members = utils::get_chat_members_dto(&state, chat.clone()).await?;
    let chat = chat.to_group_chat_dto(members);
    Ok(Json(chat))
}