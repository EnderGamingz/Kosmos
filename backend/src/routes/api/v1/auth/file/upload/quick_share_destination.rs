use crate::constants::QUICK_SHARE_FOLDER_NAME;
use crate::response::error_handling::AppError;
use crate::services::folder_service::FolderService;

pub async fn handle_quick_share_destination(
    folder_service: &FolderService,
    user_id: i64,
) -> Result<i64, AppError> {
    let quick_share_folder_name = QUICK_SHARE_FOLDER_NAME.to_string();
    let quick_share_parent = folder_service
        .check_folder_exists_by_name(&quick_share_folder_name, user_id, None)
        .await?;

    let quick_share_folder = match quick_share_parent {
        None => {
            folder_service
                .create_folder(user_id, quick_share_folder_name, None)
                .await?
        }
        Some(id) => id,
    };

    // DD,MM,YYYY HH:MM
    let new_share_folder_name = chrono::Utc::now().format("%d-%m-%Y %H:%M").to_string();

    let does_folder_exist = folder_service
        .check_folder_exists_by_name(&new_share_folder_name, user_id, Some(quick_share_folder))
        .await?
        .is_some();

    let new_share_folder_name = if does_folder_exist {
        format!(
            "{}-{}",
            new_share_folder_name,
            chrono::Utc::now().timestamp()
        )
    } else {
        new_share_folder_name
    };

    let quick_share_folder = folder_service
        .create_folder(user_id, new_share_folder_name, Some(quick_share_folder))
        .await?;

    Ok(quick_share_folder)
}