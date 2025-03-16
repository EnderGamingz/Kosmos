CREATE TABLE IF NOT EXISTS messages
(
    id         BIGSERIAL PRIMARY KEY,
    chat_id    BIGINT REFERENCES chats (id) ON DELETE CASCADE NOT NULL,
    user_id    BIGINT REFERENCES users (id) ON DELETE CASCADE NOT NULL,
    content    TEXT                                           NOT NULL,
    parent_id  BIGINT REFERENCES messages (id) ON DELETE CASCADE,
    is_edited  BOOLEAN                                        NOT NULL DEFAULT false,


    created_at TIMESTAMPTZ                                    NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ                                    NOT NULL DEFAULT now()
);

CREATE TRIGGER update_messages_modtime
    BEFORE UPDATE
    ON messages
    FOR EACH ROW
EXECUTE PROCEDURE update_modified_column();