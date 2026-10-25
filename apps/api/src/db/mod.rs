use sqlx::{postgres::PgPoolOptions, PgPool};
use std::time::Duration;
use tracing::info;

pub type DbPool = PgPool;

pub async fn create_pool(database_url: &str) -> Result<DbPool, sqlx::Error> {
    info!("Connecting to PostgreSQL database...");
    let pool = PgPoolOptions::new()
        .max_connections(20)
        .min_connections(5)
        .acquire_timeout(Duration::from_secs(10))
        .idle_timeout(Duration::from_secs(600))
        .connect(database_url)
        .await?;

    info!("Database connection pool established successfully.");
    Ok(pool)
}

pub async fn run_migrations(pool: &DbPool) -> Result<(), sqlx::migrate::MigrateError> {
    info!("Running pending database migrations from migrations/ directory...");
    sqlx::migrate!("./migrations").run(pool).await?;
    info!("All database migrations applied successfully.");
    Ok(())
}
