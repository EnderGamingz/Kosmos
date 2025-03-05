use crate::model::profile::ProfileModel;
use crate::response::error_handling::AppError;
use crate::KosmosPool;
use serde::Deserialize;
use sonyflake::Sonyflake;
use ts_rs::TS;

#[derive(Debug, Deserialize, TS)]
#[ts(export)]
pub struct UpdateProfileDTO {
    pub full_name: Option<String>,
    pub email: Option<String>,
    pub phone_number: Option<String>,
    pub website: Option<String>,
    pub bio: Option<String>,
    pub location: Option<String>,
}

#[derive(Clone)]
pub struct ProfileService {
    db_pool: KosmosPool,
    sf: Sonyflake,
}

impl ProfileService {
    pub fn new(db_pool: KosmosPool, sf: Sonyflake) -> Self {
        ProfileService { db_pool, sf }
    }

    pub async fn check_profile_exists(&self, user_id: i64) -> Result<bool, AppError> {
        sqlx::query!(
            "SELECT EXISTS(SELECT 1 FROM profiles WHERE user_id = $1) as exists",
            user_id
        )
        .fetch_one(&self.db_pool)
        .await
        .map_err(|e| {
            tracing::error!("Error checking if profile exists: {}", e);
            AppError::InternalError
        })
            .map(|row| row.exists.unwrap_or(false))
    }

    /// This will be checked upon login and if the user doesn't have a profile, one will be created
    pub async fn create_empty_profile(&self, user_id: i64) -> Result<(), AppError> {
        let id = self.sf.next_id().map_err(|_| AppError::InternalError)? as i64;
        sqlx::query!(
            "INSERT INTO profiles (id, user_id) VALUES ($1, $2)",
            id,
            user_id
        )
        .execute(&self.db_pool)
        .await
        .map_err(|e| {
            tracing::error!("Error creating empty profile: {}", e);
            AppError::InternalError
        })?;
        Ok(())
    }

    pub async fn get_profile_optional(
        &self,
        user_id: i64,
    ) -> Result<Option<ProfileModel>, AppError> {
        sqlx::query_as!(
            ProfileModel,
            "SELECT * FROM profiles WHERE user_id = $1 LIMIT 1",
            user_id
        )
        .fetch_optional(&self.db_pool)
        .await
        .map_err(|e| {
            tracing::error!("Error getting profile: {}", e);
            AppError::InternalError
        })
    }

    pub async fn update_profile(
        &self,
        user_id: i64,
        payload: &UpdateProfileDTO,
    ) -> Result<(), AppError> {
        sqlx::query!("UPDATE profiles SET full_name = $1, email = $2, phone_number = $3, website = $4, bio = $5, location = $6 WHERE user_id = $7",
            payload.full_name,
            payload.email,
            payload.phone_number,
            payload.website,
            payload.bio,
            payload.location,
            user_id
        )
        .execute(&self.db_pool)
        .await
            .map_err(|e| {
                tracing::error!("Error getting profile: {}", e);
                AppError::InternalError
            })?;

        Ok(())
    }
}
