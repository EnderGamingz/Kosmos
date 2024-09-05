use std::collections::{HashMap, VecDeque};
use crate::response::error_handling::AppError;
use crate::services::session_service::UserId;
use crate::state::AppState;

pub async fn process_folder_segments(
    state: &AppState,
    user_id: UserId,
    folder: Option<i64>,
    folder_cache: &mut HashMap<String, i64>,
    file_name_from_field: String,
) -> Result<(String, Option<i64>), AppError> {
    let mut folder_path = file_name_from_field.split("/").collect::<VecDeque<&str>>();

    if folder_path.len() == 0 {
        return Err(AppError::BadRequest {
            error: Some("File name cannot be determined".to_string()),
        });
    } else if folder_path.len() > 200 {
        return Err(AppError::BadRequest {
            error: Some("Folder Tree exceeds depth limit of 200".to_string()),
        });
    }

    let file_name = folder_path
        .pop_back()
        .ok_or_else(|| AppError::BadRequest {
            error: Some("File name cannot be determined".to_string()),
        })?
        .to_string();

    let mut relative_parent_folder = folder;

    let mut folder_path_string = "".to_string();

    while !folder_path.is_empty() {
        // Parse the path segment
        let path_segment = folder_path
            .pop_front()
            .ok_or_else(|| AppError::BadRequest {
                error: Some("Error while parsing path segment".to_string()),
            })?
            .to_string();

        folder_path_string = format!("{}/{}", folder_path_string, path_segment);

        // Get the folder id for the upload
        // Test if the folder is already cached, if not find it or create it
        let folder_id = match folder_cache.get(&folder_path_string) {
            // Cache hit
            Some(id) => *id,
            // Cache miss
            None => {
                //Check if the folder already exists in the relative folder
                let exists = state
                    .folder_service
                    .check_folder_exists_by_name(&path_segment, user_id, relative_parent_folder)
                    .await?;

                // Return the folder id if it exists
                let new_folder_id = if exists.is_some() {
                    exists.unwrap()
                } else {
                    //Create folder if not exists and return the new folder id
                    state
                        .folder_service
                        .create_folder(user_id, path_segment, relative_parent_folder)
                        .await?
                };
                // Cache folder id
                folder_cache.insert(folder_path_string.clone(), new_folder_id);

                new_folder_id
            }
        };
        relative_parent_folder = Some(folder_id);
    }
    Ok((file_name, relative_parent_folder))
}