use sqlx::postgres::PgQueryResult;
use sqlx::{PgPool, Pool, Postgres};

pub type KosmosPool = Pool<Postgres>;
pub type KosmosDbResult = PgQueryResult;

pub async fn init() -> KosmosPool {
    let db_url = std::env::var("DATABASE_URL").expect("DATABASE_URL must be set");

    let db = PgPool::connect(&*db_url).await.unwrap();

    tracing::info!(name: "bootstrap", "Connected to database at {}", db_url);

    sqlx::migrate!().run(&db).await.unwrap();

    tracing::info!(name: "bootstrap", "Migrated database");
    db
}
