use std::collections::HashMap;
use crate::model::chat::message::ChatMessageModelDTO;
use crate::response::error_handling::AppError;
use crate::services::chat_service::MessageQueryDTO;
use crate::services::session_service::SessionService;
use crate::state::{AppState, KosmosState};
use axum::extract::{Path, Query, State};
use axum::Json;
use tower_sessions::Session;

async fn get_messages_by_chat(
    state: &AppState,
    chat_id: i64,
    params: MessageQueryDTO,
) -> Result<Vec<ChatMessageModelDTO>, AppError> {
    let messages = state
        .contact_service
        .chat_service
        .get_messages(chat_id, params)
        .await?;

    let parent_ids = messages
        .iter()
        .filter_map(|m| m.parent_id)
        .collect();

    let parents = state
        .contact_service
        .chat_service
        .get_messages_by_message_ids(parent_ids)
        .await?;
    let parent_map = parents
        .into_iter()
        .map(|m| (m.id, m))
        .collect::<HashMap<i64, _>>();

    let author_ids = messages
        .iter()
        .map(|m| m.user_id)
        .chain(parent_map.keys().cloned())
        .collect();

    let authors = state
        .contact_service
        .chat_service
        .get_authors_by_user_ids(author_ids)
        .await?;

    let messages = messages
        .into_iter()
        .map(|m| {
            let parent = m.parent_id.and_then(|id| {
                parent_map.get(&id).and_then(|p| {
                    let parent_author = authors
                        .iter()
                        .find(|a| a.user_id == p.user_id)
                        .cloned()
                        .map(|author| author.into());

                    Some(p.clone().to_dto(parent_author, None))
                })
            });

            let author = authors
                .iter()
                .find(|a| a.user_id == m.user_id)
                .cloned()
                .map(|author| author.into());

            m.to_dto(author, parent)
        })
        .collect();

    Ok(messages)
}

pub async fn get_messages_for_personal_chat(
    State(state): KosmosState,
    session: Session,
    Path(other_person_id): Path<i64>,
    Query(params): Query<MessageQueryDTO>,
) -> Result<Json<Vec<ChatMessageModelDTO>>, AppError> {
    let user_id = SessionService::check_logged_in(&session).await?;

    let chat = state
        .contact_service
        .chat_service
        .get_personal_chat_optional(user_id, other_person_id)
        .await?
        .ok_or_else(|| AppError::NotFound {
            error: "Chat not found".to_string(),
        })?;

    let messages = get_messages_by_chat(&state, chat.id, params).await?;

    Ok(Json(messages))
}
