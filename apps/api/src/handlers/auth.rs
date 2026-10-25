use crate::{
    errors::AppError,
    middleware::AppState,
    models::{AuthResponseData, Claims, LoginDto, RefreshTokenDto, SignupDto, User, UserProfile},
};
use argon2::{
    password_hash::{rand_core::OsRng, PasswordHash, PasswordHasher, PasswordVerifier, SaltString},
    Argon2,
};
use axum::{extract::State, http::StatusCode, response::IntoResponse, Json};
use chrono::Utc;
use jsonwebtoken::{decode, encode, DecodingKey, EncodingKey, Header, Validation};
use serde_json::json;
use uuid::Uuid;

fn generate_tokens(
    user: &User,
    secret: &str,
    expires_in_secs: i64,
) -> Result<(String, String), AppError> {
    let now = Utc::now().timestamp() as usize;

    let access_claims = Claims {
        sub: user.id.to_string(),
        email: user.email.clone(),
        display_name: user.display_name.clone(),
        exp: now + (expires_in_secs as usize),
        iat: now,
    };

    let access_token = encode(
        &Header::default(),
        &access_claims,
        &EncodingKey::from_secret(secret.as_bytes()),
    )
    .map_err(|e| AppError::Internal(format!("Failed to create access token: {}", e)))?;

    // Refresh token valid for 30 days
    let refresh_claims = Claims {
        sub: user.id.to_string(),
        email: user.email.clone(),
        display_name: user.display_name.clone(),
        exp: now + (30 * 24 * 3600),
        iat: now,
    };

    let refresh_token = encode(
        &Header::default(),
        &refresh_claims,
        &EncodingKey::from_secret(secret.as_bytes()),
    )
    .map_err(|e| AppError::Internal(format!("Failed to create refresh token: {}", e)))?;

    Ok((access_token, refresh_token))
}

pub async fn signup(
    State(state): State<AppState>,
    Json(payload): Json<SignupDto>,
) -> Result<impl IntoResponse, AppError> {
    if payload.email.trim().is_empty() || payload.password.len() < 6 {
        return Err(AppError::Validation(
            "Email must be non-empty and password must have at least 6 characters".to_string(),
        ));
    }

    // Check if user already exists
    let existing_user = sqlx::query_as::<_, User>("SELECT * FROM users WHERE email = $1")
        .bind(payload.email.to_lowercase().trim())
        .fetch_optional(&state.pool)
        .await?;

    if existing_user.is_some() {
        return Err(AppError::Conflict("A user with this email already exists".to_string()));
    }

    // Hash password with Argon2
    let salt = SaltString::generate(&mut OsRng);
    let argon2 = Argon2::default();
    let password_hash = argon2
        .hash_password(payload.password.as_bytes(), &salt)
        .map_err(|e| AppError::Internal(format!("Failed to hash password: {}", e)))?
        .to_string();

    let cursor_color = payload
        .cursor_color
        .unwrap_or_else(|| "#6366f1".to_string());

    let user = sqlx::query_as::<_, User>(
        r#"
        INSERT INTO users (email, display_name, avatar_url, cursor_color, password_hash)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
        "#,
    )
    .bind(payload.email.to_lowercase().trim())
    .bind(payload.display_name.trim())
    .bind(payload.avatar_url)
    .bind(cursor_color)
    .bind(password_hash)
    .fetch_one(&state.pool)
    .await?;

    let (access_token, refresh_token) =
        generate_tokens(&user, &state.config.jwt_secret, state.config.jwt_expires_in)?;

    let auth_data = AuthResponseData {
        access_token,
        refresh_token,
        expires_in: state.config.jwt_expires_in,
        user: user.into(),
    };

    Ok((
        StatusCode::CREATED,
        Json(json!({
            "data": auth_data
        })),
    ))
}

pub async fn login(
    State(state): State<AppState>,
    Json(payload): Json<LoginDto>,
) -> Result<impl IntoResponse, AppError> {
    let user = sqlx::query_as::<_, User>("SELECT * FROM users WHERE email = $1 AND is_active = true")
        .bind(payload.email.to_lowercase().trim())
        .fetch_optional(&state.pool)
        .await?
        .ok_or_else(|| AppError::Unauthorized("Invalid email or password".to_string()))?;

    let hash_str = user
        .password_hash
        .as_ref()
        .ok_or_else(|| AppError::Unauthorized("Account uses OAuth sign-in".to_string()))?;

    let parsed_hash = PasswordHash::new(hash_str)
        .map_err(|e| AppError::Internal(format!("Invalid password hash: {}", e)))?;

    Argon2::default()
        .verify_password(payload.password.as_bytes(), &parsed_hash)
        .map_err(|_| AppError::Unauthorized("Invalid email or password".to_string()))?;

    let (access_token, refresh_token) =
        generate_tokens(&user, &state.config.jwt_secret, state.config.jwt_expires_in)?;

    let auth_data = AuthResponseData {
        access_token,
        refresh_token,
        expires_in: state.config.jwt_expires_in,
        user: user.into(),
    };

    Ok((
        StatusCode::OK,
        Json(json!({
            "data": auth_data
        })),
    ))
}

pub async fn refresh_token(
    State(state): State<AppState>,
    Json(payload): Json<RefreshTokenDto>,
) -> Result<impl IntoResponse, AppError> {
    let token_data = decode::<Claims>(
        &payload.refresh_token,
        &DecodingKey::from_secret(state.config.jwt_secret.as_bytes()),
        &Validation::default(),
    )
    .map_err(|_| AppError::Unauthorized("Invalid or expired refresh token".to_string()))?;

    let user_id = Uuid::parse_str(&token_data.claims.sub)
        .map_err(|_| AppError::Unauthorized("Invalid user ID in token".to_string()))?;

    let user = sqlx::query_as::<_, User>("SELECT * FROM users WHERE id = $1 AND is_active = true")
        .bind(user_id)
        .fetch_optional(&state.pool)
        .await?
        .ok_or_else(|| AppError::Unauthorized("User not found".to_string()))?;

    let (access_token, new_refresh_token) =
        generate_tokens(&user, &state.config.jwt_secret, state.config.jwt_expires_in)?;

    let auth_data = AuthResponseData {
        access_token,
        refresh_token: new_refresh_token,
        expires_in: state.config.jwt_expires_in,
        user: user.into(),
    };

    Ok((
        StatusCode::OK,
        Json(json!({
            "data": auth_data
        })),
    ))
}

pub async fn logout() -> impl IntoResponse {
    (
        StatusCode::OK,
        Json(json!({
            "data": {
                "message": "Successfully logged out"
            }
        })),
    )
}
