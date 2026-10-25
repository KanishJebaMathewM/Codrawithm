use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Comment {
    pub id: Uuid,
    pub board_id: Uuid,
    pub object_id: Option<String>,
    pub canvas_x: Option<f64>,
    pub canvas_y: Option<f64>,
    pub resolved: bool,
    pub resolved_by: Option<Uuid>,
    pub resolved_at: Option<DateTime<Utc>>,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct CommentMessage {
    pub id: Uuid,
    pub comment_id: Uuid,
    pub author_id: Uuid,
    pub text: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
pub struct CreateCommentDto {
    #[serde(rename = "objectId")]
    pub object_id: Option<String>,
    #[serde(rename = "canvasX")]
    pub canvas_x: Option<f64>,
    #[serde(rename = "canvasY")]
    pub canvas_y: Option<f64>,
    pub text: String,
}

#[derive(Debug, Deserialize)]
pub struct CreateMessageDto {
    pub text: String,
}
