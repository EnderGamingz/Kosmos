use crate::model::role::{Permission, Role};
use crate::model::user::UserModel;
use crate::response::error_handling::AppError;
use crate::services::user_service::UserService;
use crate::model::jwt::JwtClaims;

#[derive(Clone)]
pub struct PermissionService {
    user_service: UserService,
}

impl PermissionService {
    pub fn new(user_service: UserService) -> Self {
        PermissionService {
            user_service,
        }
    }

    pub async fn verify_permission(
        &self,
        jwt_claims: &JwtClaims,
        permission: Permission,
    ) -> Result<UserModel, AppError> {
        let user = self.user_service.get_auth_user(jwt_claims.user.user_id).await?;
        let role = Role::new(user.role);

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
        jwt_claims: &JwtClaims,
        permissions: Vec<Permission>,
    ) -> Result<UserModel, AppError> {
        let user = self.user_service.get_auth_user(jwt_claims.user.user_id).await?;
        let role = Role::new(user.role);

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
