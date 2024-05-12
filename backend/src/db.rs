use sqlx::postgres::PgQueryResult;
use sqlx::{PgPool, Pool, Postgres};

pub type KosmosPool = Pool<Postgres>;
pub type KosmosDbResult = PgQueryResult;

pub async fn init() -> KosmosPool {
    let db_url = std::env::var("DATABASE_URL").expect("DATABASE_URL must be set");

    tracing::info!(name: "bootstrap", "Connecting to database at {}...", db_url);

    let db = PgPool::connect(&*db_url).await.unwrap();

    tracing::info!(name: "bootstrap", "Database connection established");

    tracing::info!(name: "bootstrap", "Migrating database...");
    sqlx::migrate!().run(&db).await.unwrap();

    tracing::info!(name: "bootstrap", "Database migration complete");
    db
}
