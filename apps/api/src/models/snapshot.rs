use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct BoardSnapshot {
    pub id: Uuid,
    pub board_id: Uuid,
    pub name: Option<String>,
    #[serde(skip_serializing)]
    pub crdt_state: Vec<u8>,
    pub auto: bool,
    pub created_by: Option<Uuid>,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
pub struct CreateSnapshotDto {
    pub name: Option<String>,
}
