use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Board {
    pub id: Uuid,
    pub title: String,
    pub workspace_type: String,
    pub owner_id: Uuid,
    pub is_public: bool,
    pub share_token: String,
    pub settings: serde_json::Value,
    pub thumbnail_url: Option<String>,
    pub is_deleted: bool,
    pub deleted_at: Option<DateTime<Utc>>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
pub struct CreateBoardDto {
    pub title: Option<String>,
    #[serde(rename = "workspaceType")]
    pub workspace_type: Option<String>,
    #[serde(rename = "isPublic")]
    pub is_public: Option<bool>,
    pub settings: Option<serde_json::Value>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateBoardDto {
    pub title: Option<String>,
    #[serde(rename = "workspaceType")]
    pub workspace_type: Option<String>,
    #[serde(rename = "isPublic")]
    pub is_public: Option<bool>,
    pub settings: Option<serde_json::Value>,
    #[serde(rename = "thumbnailUrl")]
    pub thumbnail_url: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct BoardMember {
    pub id: Uuid,
    pub board_id: Uuid,
    pub user_id: Option<Uuid>,
    pub role: String,
    pub invited_by: Option<Uuid>,
    pub joined_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
pub struct AddMemberDto {
    #[serde(rename = "userId")]
    pub user_id: Uuid,
    pub role: String,
}

#[derive(Debug, Deserialize)]
pub struct UpdateMemberRoleDto {
    pub role: String,
}
