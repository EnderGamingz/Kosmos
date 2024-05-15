use axum::http::StatusCode;
use axum::response::{IntoResponse, Response};
use serde::Serialize;

use crate::response::error_handling::AppError;

pub type ResponseResult = Result<AppSuccess, AppError>;

#[derive(Serialize)]
pub struct SuccessResponse {
    pub(crate) message: Option<String>,
}

#[derive(Serialize)]
pub enum AppSuccess {
    OK { data: Option<String> },
    CREATED { id: Option<i64> },
    DELETED,
    UPDATED,
}

impl IntoResponse for AppSuccess {
    fn into_response(self) -> Response {
        let status_code;
        let mut body = "".to_string();

        match self {
            Self::OK { data } => {
                status_code = StatusCode::OK;
                if let Some(data) = data {
                    body = data;
                }
            }
            Self::CREATED { id } => {
                status_code = StatusCode::CREATED;

                if let Some(id) = id {
                    body = id.to_string();
                }
            }
            Self::DELETED | Self::UPDATED => status_code = StatusCode::ACCEPTED,
        }

        let response_body = SuccessResponse {
            message: Some(body),
        };

        (status_code, serde_json::to_string(&response_body).unwrap()).into_response()
    }
}
