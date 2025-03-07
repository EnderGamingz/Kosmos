use serde::Serialize;
use sqlx::Type;

#[derive(Clone, Copy, Debug, PartialEq, Serialize, Type)]
pub enum ContactRequestStatus {
    Pending,
    Declined,
    Accepted,
}

impl From<&str> for ContactRequestStatus {
    fn from(s: &str) -> ContactRequestStatus {
        match s {
            "pending" => ContactRequestStatus::Pending,
            "declined" => ContactRequestStatus::Declined,
            "accepted" => ContactRequestStatus::Accepted,
            _ => ContactRequestStatus::Pending,
        }
    }
}

impl From<String> for ContactRequestStatus {
    fn from(s: String) -> ContactRequestStatus {
        match s.as_str() {
            "pending" => ContactRequestStatus::Pending,
            "declined" => ContactRequestStatus::Declined,
            "accepted" => ContactRequestStatus::Accepted,
            _ => ContactRequestStatus::Pending,
        }
    }
}

impl ContactRequestStatus {
    pub fn new(s: &str) -> ContactRequestStatus {
        match s {
            "pending" => ContactRequestStatus::Pending,
            "declined" => ContactRequestStatus::Declined,
            "accepted" => ContactRequestStatus::Accepted,
            _ => ContactRequestStatus::Pending,
        }
    }
    pub fn to_string(&self) -> String {
        match self {
            ContactRequestStatus::Pending => "pending".to_string(),
            ContactRequestStatus::Declined => "declined".to_string(),
            ContactRequestStatus::Accepted => "accepted".to_string(),
        }
    }
}
