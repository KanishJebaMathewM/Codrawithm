use crate::{
    handlers::{
        assets::*, auth::*, boards::*, comments::*, health::*, members::*, plugins::*,
        snapshots::*,
    },
    middleware::AppState,
    ws::ws_handler,
};
use axum::{
    http::{header, HeaderValue, Method},
    routing::{delete, get, patch, post},
    Router,
};
use tower_http::cors::{Any, CorsLayer};
use tower_http::trace::TraceLayer;

pub fn create_router(state: AppState) -> Router {
    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods([
            Method::GET,
            Method::POST,
            Method::PATCH,
            Method::DELETE,
            Method::OPTIONS,
        ])
        .allow_headers([
            header::AUTHORIZATION,
            header::ACCEPT,
            header::CONTENT_TYPE,
        ]);

    let api_v1 = Router::new()
        // Boards
        .route("/boards", get(list_boards).post(create_board))
        .route(
            "/boards/:id",
            get(get_board).patch(update_board).delete(delete_board),
        )
        .route("/boards/:id/duplicate", post(duplicate_board))
        .route("/boards/share/:share_token", get(get_by_share_token))
        // Board members
        .route("/boards/:id/members", get(list_members).post(add_member))
        .route(
            "/boards/:id/members/:user_id",
            patch(update_member).delete(remove_member),
        )
        // Snapshots
        .route(
            "/boards/:id/snapshots",
            get(list_snapshots).post(create_snapshot),
        )
        .route(
            "/boards/:id/snapshots/:snapshot_id/restore",
            post(restore_snapshot),
        )
        // Assets
        .route("/boards/:id/assets/upload-url", post(get_upload_url))
        .route("/boards/:id/assets/confirm", post(confirm_asset))
        .route("/boards/:id/assets", get(list_assets))
        .route("/boards/:id/assets/:asset_id", delete(delete_asset))
        // Comments
        .route(
            "/boards/:id/comments",
            get(list_comments).post(create_comment),
        )
        .route(
            "/boards/:id/comments/:comment_id/messages",
            post(add_message),
        )
        .route(
            "/boards/:id/comments/:comment_id/resolve",
            patch(resolve_comment),
        )
        // Plugins
        .route("/plugins", get(list_plugins).post(install_plugin))
        .route(
            "/plugins/:id",
            get(get_plugin).delete(uninstall_plugin),
        );

    Router::new()
        // Health probes
        .route("/health", get(alive))
        .route("/ready", get(ready))
        // Auth routes
        .route("/auth/signup", post(signup))
        .route("/auth/login", post(login))
        .route("/auth/refresh", post(refresh_token))
        .route("/auth/logout", post(logout))
        // API v1
        .nest("/api/v1", api_v1)
        // WebSocket
        .route("/ws/board/:board_id", get(ws_handler))
        .layer(cors)
        .layer(TraceLayer::new_for_http())
        .with_state(state)
}
