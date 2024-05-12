CREATE TABLE IF NOT EXISTS folder
(
    id          BIGINT PRIMARY KEY,
    user_id     BIGINT      NOT NULL REFERENCES users (id),
    folder_name TEXT        NOT NULL,

    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALter TABLE folder
    ADD COLUMN parent_id BIGINT REFERENCES folder (id);

CREATE TRIGGER update_folder_modtime
    BEFORE UPDATE
    ON folder
    FOR EACH ROW
EXECUTE PROCEDURE update_modified_column();