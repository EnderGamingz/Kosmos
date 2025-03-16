CREATE TABLE IF NOT EXISTS chats
(
    id          BIGSERIAL PRIMARY KEY,
    name        TEXT        NOT NULL,
    description TEXT,
    chat_type        TEXT        NOT NULL,

    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER update_chats_modtime
    BEFORE UPDATE
    ON chats
    FOR EACH ROW
EXECUTE PROCEDURE update_modified_column();

CREATE TABLE IF NOT EXISTS chat_members
(
    chat_id    BIGINT REFERENCES chats (id) ON DELETE CASCADE,
    user_id    BIGINT REFERENCES users (id) ON DELETE CASCADE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (chat_id, user_id),
    UNIQUE (chat_id, user_id)
);