use crate::{
    errors::AppError,
    middleware::{AppState, AuthUser},
    models::{AddMemberDto, BoardMember, UpdateMemberRoleDto},
};
use axum::{
    extract::{Path, State},
    http::StatusCode,
    response::IntoResponse,
    Json,
};
use serde_json::json;
use uuid::Uuid;

async fn ensure_board_owner(pool: &sqlx::PgPool, board_id: Uuid, user_id: Uuid) -> Result<(), AppError> {
    let owner_check: Option<(Uuid,)> = sqlx::query_as(
        "SELECT id FROM boards WHERE id = $1 AND owner_id = $2 AND is_deleted = false"
    )
    .bind(board_id)
    .bind(user_id)
    .fetch_optional(pool)
    .await?;

    if owner_check.is_none() {
        return Err(AppError::Forbidden("Only the board owner can manage members".to_string()));
    }
    Ok(())
}

pub async fn list_members(
    State(state): State<AppState>,
    auth: AuthUser,
    Path(board_id): Path<Uuid>,
) -> Result<impl IntoResponse, AppError> {
    // Verify user has access to board
    let access: Option<(Uuid,)> = sqlx::query_as(
        r#"
        SELECT b.id FROM boards b
        LEFT JOIN board_members bm ON b.id = bm.board_id
        WHERE b.id = $1 AND b.is_deleted = false
          AND (b.owner_id = $2 OR bm.user_id = $2 OR b.is_public = true)
        "#,
    )
    .bind(board_id)
    .bind(auth.id)
    .fetch_optional(&state.pool)
    .await?;

    if access.is_none() {
        return Err(AppError::NotFound("Board not found or access denied".to_string()));
    }

    let members = sqlx::query_as::<_, BoardMember>(
        "SELECT * FROM board_members WHERE board_id = $1 ORDER BY joined_at ASC"
    )
    .bind(board_id)
    .fetch_all(&state.pool)
    .await?;

    Ok((
        StatusCode::OK,
        Json(json!({
            "data": members
        })),
    ))
}

pub async fn add_member(
    State(state): State<AppState>,
    auth: AuthUser,
    Path(board_id): Path<Uuid>,
    Json(payload): Json<AddMemberDto>,
) -> Result<impl IntoResponse, AppError> {
    ensure_board_owner(&state.pool, board_id, auth.id).await?;

    if !["owner", "editor", "commenter", "viewer"].contains(&payload.role.as_str()) {
        return Err(AppError::Validation("Role must be owner, editor, commenter, or viewer".to_string()));
    }

    let member = sqlx::query_as::<_, BoardMember>(
        r#"
        INSERT INTO board_members (board_id, user_id, role, invited_by)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (board_id, user_id)
        DO UPDATE SET role = EXCLUDED.role
        RETURNING *
        "#,
    )
    .bind(board_id)
    .bind(payload.user_id)
    .bind(payload.role)
    .bind(auth.id)
    .fetch_one(&state.pool)
    .await?;

    Ok((
        StatusCode::CREATED,
        Json(json!({
            "data": member
        })),
    ))
}

pub async fn update_member(
    State(state): State<AppState>,
    auth: AuthUser,
    Path((board_id, target_user_id)): Path<(Uuid, Uuid)>,
    Json(payload): Json<UpdateMemberRoleDto>,
) -> Result<impl IntoResponse, AppError> {
    ensure_board_owner(&state.pool, board_id, auth.id).await?;

    if !["owner", "editor", "commenter", "viewer"].contains(&payload.role.as_str()) {
        return Err(AppError::Validation("Role must be owner, editor, commenter, or viewer".to_string()));
    }

    let member = sqlx::query_as::<_, BoardMember>(
        r#"
        UPDATE board_members
        SET role = $1
        WHERE board_id = $2 AND user_id = $3
        RETURNING *
        "#,
    )
    .bind(payload.role)
    .bind(board_id)
    .bind(target_user_id)
    .fetch_optional(&state.pool)
    .await?
    .ok_or_else(|| AppError::NotFound("Member not found on this board".to_string()))?;

    Ok((
        StatusCode::OK,
        Json(json!({
            "data": member
        })),
    ))
}

pub async fn remove_member(
    State(state): State<AppState>,
    auth: AuthUser,
    Path((board_id, target_user_id)): Path<(Uuid, Uuid)>,
) -> Result<impl IntoResponse, AppError> {
    ensure_board_owner(&state.pool, board_id, auth.id).await?;

    let result = sqlx::query(
        "DELETE FROM board_members WHERE board_id = $1 AND user_id = $2"
    )
    .bind(board_id)
    .bind(target_user_id)
    .execute(&state.pool)
    .await?;

    if result.rows_affected() == 0 {
        return Err(AppError::NotFound("Member not found on this board".to_string()));
    }

    Ok((
        StatusCode::OK,
        Json(json!({
            "data": {
                "message": "Member removed successfully"
            }
        })),
    ))
}
