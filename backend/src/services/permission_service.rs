use crate::db::KosmosPool;
use crate::model::role::{Permission, Role};
use crate::model::user::UserModel;
use crate::response::error_handling::AppError;
use crate::services::session_service::SessionService;
use crate::services::user_service::UserService;
use tower_sessions::Session;

#[derive(Clone)]
pub struct PermissionService {
    db_pool: KosmosPool,
    user_service: UserService,
}

impl PermissionService {
    pub fn new(db_pool: KosmosPool, user_service: UserService) -> Self {
        PermissionService {
            db_pool,
            user_service,
        }
    }

    pub async fn verify_permission(
        &self,
        session: &Session,
        permission: Permission,
    ) -> Result<UserModel, AppError> {
        let user_id = SessionService::check_logged_in(&session).await?;
        let user = self.user_service.get_auth_user(user_id).await?;
        let role = Role::by_id(user.role);

        let has_permissions = role.has_permission(permission);

        if has_permissions {
            Ok(user)
        } else {
            Err(AppError::NotAllowed {
                error: "Forbidden".to_string(),
            })
        }
    }

    pub async fn verify_permissions(
        &self,
        session: &Session,
        permissions: Vec<Permission>,
    ) -> Result<UserModel, AppError> {
        let user_id = SessionService::check_logged_in(&session).await?;
        let user = self.user_service.get_auth_user(user_id).await?;
        let role = Role::by_id(user.role);

        let has_permissions = role.has_permissions(permissions);

        if has_permissions {
            Ok(user)
        } else {
            Err(AppError::NotAllowed {
                error: "Forbidden".to_string(),
            })
        }
    }
}
