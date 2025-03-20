use crate::model::chat::chat::DbChatModel;
use crate::model::chat::members::ChatMemberModelDTO;
use crate::model::internal::presence::index::PresenceMessage;
use crate::response::error_handling::AppError;
use crate::services::chat_service::ChatService;
use crate::state::AppState;

pub async fn get_chat_members_dto(
    state: &AppState,
    chat: DbChatModel,
) -> Result<Vec<ChatMemberModelDTO>, AppError> {
    let members = state
        .contact_service
        .chat_service
        .get_chat_members_by_chat_id(chat.id)
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

pub async fn notify_group_chat_members(
    state: &AppState,
    chat_id: i64,
    user_id: i64,
    message: PresenceMessage,
) -> Result<(), AppError> {
    let members = state
        .contact_service
        .chat_service
        .get_chat_members_by_chat_id(chat_id)
        .await?;
    let member_ids = members
        .clone()
        .into_iter()
        .map(|c| c.user_id)
        .collect::<Vec<i64>>();

    for member_id in member_ids {
        if member_id != user_id {
            state
                .presence_handler
                .broadcast_to_user(member_id, message.clone())
                .await;
        }
    }

    Ok(())
}
