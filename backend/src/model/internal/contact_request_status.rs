use serde::Serialize;
use sqlx::Type;
use ts_rs::TS;

#[derive(Clone, Copy, Debug, PartialEq, Serialize, Type, TS)]
#[ts(export)]
pub enum ContactRequestStatus {
    Pending,
    Declined,
    Accepted,
}

impl From<&str> for ContactRequestStatus {
    fn from(s: &str) -> ContactRequestStatus {
        match s {
            "Pending" => ContactRequestStatus::Pending,
            "Declined" => ContactRequestStatus::Declined,
            "Accepted" => ContactRequestStatus::Accepted,
            _ => ContactRequestStatus::Pending,
        }
    }
}

impl From<String> for ContactRequestStatus {
    fn from(s: String) -> ContactRequestStatus {
        match s.as_str() {
            "Pending" => ContactRequestStatus::Pending,
            "Declined" => ContactRequestStatus::Declined,
            "Accepted" => ContactRequestStatus::Accepted,
            _ => ContactRequestStatus::Pending,
        }
    }
}

impl ContactRequestStatus {
    pub fn new(s: &str) -> ContactRequestStatus {
        match s {
            "Pending" => ContactRequestStatus::Pending,
            "Declined" => ContactRequestStatus::Declined,
            "Accepted" => ContactRequestStatus::Accepted,
            _ => ContactRequestStatus::Pending,
        }
    }
    pub fn to_string(&self) -> String {
        match self {
            ContactRequestStatus::Pending => "Pending".to_string(),
            ContactRequestStatus::Declined => "Declined".to_string(),
            ContactRequestStatus::Accepted => "Accepted".to_string(),
        }
    }
}
