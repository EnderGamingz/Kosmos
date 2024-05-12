CREATE TABLE IF NOT EXISTS files
(
    id               BIGINT PRIMARY KEY,
    user_id          BIGINT      NOT NULL REFERENCES users (id),
    file_name        TEXT        NOT NULL,
    file_size        BIGINT      NOT NULL,
    file_type        int2        NOT NULL,
    mime_type        TEXT        NOT NULL,
    metadata         JSONB,

    parent_folder_id BIGINT REFERENCES folder (id),

    created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);


CREATE TRIGGER update_files_modtime
    BEFORE UPDATE
    ON files
    FOR EACH ROW
EXECUTE PROCEDURE update_modified_column();