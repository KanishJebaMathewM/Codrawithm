use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct User {
    pub id: Uuid,
    pub email: String,
    pub display_name: String,
    pub avatar_url: Option<String>,
    pub cursor_color: String,
    #[serde(skip_serializing)]
    pub password_hash: Option<String>,
    pub tier: String,
    pub is_active: bool,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UserProfile {
    pub id: Uuid,
    pub email: String,
    pub display_name: String,
    pub avatar_url: Option<String>,
    pub cursor_color: String,
    pub tier: String,
    pub created_at: DateTime<Utc>,
}

impl From<User> for UserProfile {
    fn from(user: User) -> Self {
        Self {
            id: user.id,
            email: user.email,
            display_name: user.display_name,
            avatar_url: user.avatar_url,
            cursor_color: user.cursor_color,
            tier: user.tier,
            created_at: user.created_at,
        }
    }
}

#[derive(Debug, Deserialize)]
pub struct SignupDto {
    pub email: String,
    pub password: String,
    pub display_name: String,
    pub avatar_url: Option<String>,
    pub cursor_color: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct LoginDto {
    pub email: String,
    pub password: String,
}

#[derive(Debug, Serialize)]
pub struct AuthResponseData {
    #[serde(rename = "accessToken")]
    pub access_token: String,
    #[serde(rename = "refreshToken")]
    pub refresh_token: String,
    #[serde(rename = "expiresIn")]
    pub expires_in: i64,
    pub user: UserProfile,
}

#[derive(Debug, Deserialize)]
pub struct RefreshTokenDto {
    #[serde(rename = "refreshToken")]
    pub refresh_token: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Claims {
    pub sub: String,         // User UUID
    pub email: String,
    pub display_name: String,
    pub exp: usize,          // Expiration epoch seconds
    pub iat: usize,          // Issued at epoch seconds
}

#[derive(Debug, Deserialize)]
pub struct UpdateProfileDto {
    pub display_name: Option<String>,
    pub avatar_url: Option<String>,
    pub cursor_color: Option<String>,
}
