CREATE TABLE IF NOT EXISTS operations
(
    id               BIGINT PRIMARY KEY,
    user_id          BIGINT      NOT NULL REFERENCES users (id) ON DELETE CASCADE,

    operation_type   INT2        NOT NULL,
    operation_status INT2        NOT NULL,

    metadata         JSONB,

    started_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    ended_at         TIMESTAMPTZ,
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);


CREATE TRIGGER update_operations_modtime
    BEFORE UPDATE
    ON operations
    FOR EACH ROW
EXECUTE PROCEDURE update_modified_column();