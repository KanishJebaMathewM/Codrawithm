use std::env;

#[derive(Debug, Clone)]
pub struct Config {
    pub port: u16,
    pub host: String,
    pub database_url: String,
    pub redis_url: String,
    pub jwt_secret: String,
    pub jwt_expires_in: i64,
    pub cors_origin: String,
}

impl Config {
    pub fn from_env() -> Self {
        dotenvy::dotenv().ok();

        let port = env::var("PORT")
            .ok()
            .and_then(|p| p.parse::<u16>().ok())
            .unwrap_or(3002);

        let host = env::var("HOST").unwrap_or_else(|_| "0.0.0.0".to_string());

        let database_url = env::var("DATABASE_URL").unwrap_or_else(|_| {
            "postgres://codrawithm:devpassword@localhost:5432/codrawithm_dev".to_string()
        });

        let redis_url = env::var("REDIS_URL")
            .unwrap_or_else(|_| "redis://localhost:6379".to_string());

        let jwt_secret = env::var("JWT_SECRET")
            .unwrap_or_else(|_| "local-dev-jwt-secret-key-32-chars-long".to_string());

        let jwt_expires_in = env::var("JWT_EXPIRES_IN")
            .ok()
            .and_then(|e| e.parse::<i64>().ok())
            .unwrap_or(900); // 15 minutes default

        let cors_origin = env::var("CORS_ORIGIN")
            .unwrap_or_else(|_| "http://localhost:3000".to_string());

        Self {
            port,
            host,
            database_url,
            redis_url,
            jwt_secret,
            jwt_expires_in,
            cors_origin,
        }
    }
}
