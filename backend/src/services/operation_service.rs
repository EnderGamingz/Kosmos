use crate::db::KosmosPool;
use crate::model::operation::OperationModel;
use crate::response::error_handling::AppError;
use crate::services::session_service::UserId;
use sonyflake::Sonyflake;
use sqlx::types::JsonValue;
use crate::model::internal::operation_status::OperationStatus;
use crate::model::internal::operation_type::OperationType;

#[derive(Clone)]
pub struct OperationService {
    db_pool: KosmosPool,
    sf: Sonyflake,
}

impl OperationService {
    pub fn new(db_pool: KosmosPool, sf: Sonyflake) -> Self {
        OperationService { db_pool, sf }
    }

    pub async fn create_operation(
        &self,
        user_id: UserId,
        operation_type: OperationType,
        operation_status: OperationStatus,
        metadata: Option<JsonValue>,
    ) -> Result<OperationModel, AppError> {
        let operation = sqlx::query_as!(
            OperationModel,
            "INSERT INTO operations (id, user_id, operation_type, operation_status, metadata) VALUES ($1, $2, $3, $4, $5) RETURNING *",
            self.sf.next_id().map_err(|_| AppError::InternalError)? as i64,
            user_id,
            operation_type as i16,
            operation_status as i16,
            metadata,
        )
            .fetch_one(&self.db_pool)
            .await
            .map_err(|e| {
                tracing::error!("Error creating operation: {}", e);
                AppError::InternalError
            })?;
        Ok(operation)
    }

    pub async fn update_operation(
        &self,
        operation_id: i64,
        operation_status: OperationStatus,
        result: Option<String>,
    ) -> Result<(), AppError> {
        let has_ended = operation_status != OperationStatus::Pending
            && operation_status != OperationStatus::Interrupted;

        if has_ended {
            sqlx::query!(
                "UPDATE operations SET operation_status = $1, result = $2, ended_at = now() WHERE id = $3",
                operation_status as i16,
                result,
                operation_id
            )
            .execute(&self.db_pool)
            .await
            .map_err(|e| {
                tracing::error!("Error updating operation {}: {}", operation_id, e);
                AppError::InternalError
            })?;
        } else {
            sqlx::query!(
                "UPDATE operations SET operation_status = $1, result = $2 WHERE id = $3",
                operation_status as i16,
                result,
                operation_id
            )
            .execute(&self.db_pool)
            .await
            .map_err(|e| {
                tracing::error!("Error updating operation {}: {}", operation_id, e);
                AppError::InternalError
            })?;
        }
        Ok(())
    }

    pub async fn get_operation_by_id(&self, operation_id: i64) -> Result<OperationModel, AppError> {
        let operation = sqlx::query_as!(
            OperationModel,
            "SELECT * FROM operations WHERE id = $1;",
            operation_id
        )
        .fetch_one(&self.db_pool)
        .await
        .map_err(|e| {
            tracing::error!("Error fetching operation {}: {}", operation_id, e);
            AppError::InternalError
        })?;
        Ok(operation)
    }

    pub async fn get_operation_for_user_by_id(
        &self,
        operation_id: i64,
        user_id: i64,
    ) -> Result<OperationModel, AppError> {
        let operation = sqlx::query_as!(
            OperationModel,
            "SELECT * FROM operations WHERE id = $1 AND user_id = $2",
            operation_id,
            user_id
        )
        .fetch_one(&self.db_pool)
        .await
        .map_err(|e| {
            tracing::error!("Error fetching operation {}: {}", operation_id, e);
            AppError::InternalError
        })?;
        Ok(operation)
    }

    pub async fn get_operations_by_user_id(
        &self,
        user_id: i64,
        limit: i64,
    ) -> Result<Vec<OperationModel>, AppError> {
        let operations = sqlx::query_as!(
            OperationModel,
            "SELECT * FROM operations WHERE user_id = $1 ORDER BY started_at DESC LIMIT $2",
            user_id,
            limit
        )
        .fetch_all(&self.db_pool)
        .await
        .map_err(|e| {
            tracing::error!("Error fetching operations for user {}: {}", user_id, e);
            AppError::InternalError
        })?;
        Ok(operations)
    }

    pub async fn delete_operation(&self, operation_id: i64, user_id: i64) -> Result<(), AppError> {
        sqlx::query!(
            "DELETE FROM operations WHERE id = $1 AND user_id = $2",
            operation_id,
            user_id
        )
        .execute(&self.db_pool)
        .await
        .map_err(|e| {
            tracing::error!("Error deleting operation {}: {}", operation_id, e);
            AppError::InternalError
        })?;
        Ok(())
    }

    pub async fn startup_prepare(&self) {
        let _ = sqlx::query!(
            "UPDATE operations SET operation_status = $1 WHERE operation_status = $2",
            OperationStatus::Interrupted as i16,
            OperationStatus::Pending as i16
        )
        .execute(&self.db_pool)
        .await
        .map_err(|e| {
            tracing::error!("Error preparing operations for startup: {}", e);
            AppError::InternalError
        });
        tracing::info!("Prepared operations for startup");
    }
}
