use std::sync::Arc;
use tracing::info;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt, EnvFilter};

mod config;
mod db;
mod errors;
mod handlers;
mod middleware;
mod models;
mod routes;
mod services;
mod ws;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Initialize tracing / structured logging
    tracing_subscriber::registry()
        .with(EnvFilter::try_from_default_env().unwrap_or_else(|_| "info,codrawithm_api=debug".into()))
        .with(tracing_subscriber::fmt::layer())
        .init();

    info!("Starting Codrawithm API service...");

    // Load configuration
    let config = config::Config::from_env();
    let addr = format!("{}:{}", config.host, config.port);

    // Initialize database pool
    let pool = db::create_pool(&config.database_url).await?;

    // Run schema migrations
    db::run_migrations(&pool).await?;

    let state = middleware::AppState {
        pool,
        config: Arc::new(config),
    };

    // Build Axum router
    let app = routes::create_router(state);

    info!("Listening on http://{}", addr);
    let listener = tokio::net::TcpListener::bind(&addr).await?;
    axum::serve(listener, app).await?;

    Ok(())
}
