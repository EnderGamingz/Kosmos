use crate::model::chat::chat::{ChatModelDTO, DbChatModel};
use crate::model::chat::members::ChatMemberModelDTO;
use crate::response::error_handling::AppError;
use crate::services::chat_service::ChatService;
use crate::services::session_service::SessionService;
use crate::state::{AppState, KosmosState};
use axum::extract::{Path, State};
use axum::Json;
use tower_sessions::Session;
use crate::model::internal::chat_type::ChatType;

async fn get_chat_members(
    state: &AppState,
    chat: DbChatModel,
) -> Result<Vec<ChatMemberModelDTO>, AppError> {
    let members = state
        .contact_service
        .chat_service
        .get_chat_members(chat.id)
        .await?;
    let member_ids = members
        .clone()
        .into_iter()
        .map(|c| c.user_id)
        .collect::<Vec<i64>>();
    let member_profiles = state
        .contact_service
        .chat_service
        .get_chat_members_profiles(member_ids)
        .await?;

    Ok(ChatService::zip_chat_members_profiles(
        members,
        member_profiles,
    ))
}

pub async fn get_chats(
    State(state): KosmosState,
    session: Session,
) -> Result<Json<Vec<ChatModelDTO>>, AppError> {
    let user_id = SessionService::check_logged_in(&session).await?;

    let chat = state
        .contact_service
        .chat_service
        .get_chats(user_id)
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

pub async fn get_personal_chat(
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

    let members = get_chat_members(&state, chat.clone()).await?;
    let chat = chat.to_personal_chat_dto(user_id, members);
    Ok(Json(chat))
}
