CREATE TABLE IF NOT EXISTS profiles
(
    id          BIGSERIAL PRIMARY KEY,
    user_id     BIGINT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    full_name   TEXT,
    email       TEXT,
    phone_number TEXT,
    website     TEXT,
    bio         TEXT,
    location    TEXT,

    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER update_profile_modtime
    BEFORE UPDATE
    ON profiles
    FOR EACH ROW
EXECUTE PROCEDURE update_modified_column();