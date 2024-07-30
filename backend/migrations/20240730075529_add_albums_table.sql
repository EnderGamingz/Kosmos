CREATE TABLE IF NOT EXISTS albums
(
    id          BIGSERIAL PRIMARY KEY,
    user_id     BIGINT      NOT NULL REFERENCES users (id),
    name        TEXT        NOT NULL,
    description TEXT,

    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER update_albums_modtime
    BEFORE UPDATE
    ON albums
    FOR EACH ROW
EXECUTE PROCEDURE update_modified_column();

CREATE TABLE IF NOT EXISTS files_on_album
(
    album_id   BIGINT REFERENCES albums (id) ON DELETE CASCADE,
    file_id    BIGINT REFERENCES files (id) ON DELETE CASCADE,
    PRIMARY KEY (album_id, file_id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (album_id, file_id)
);

CREATE INDEX IF NOT EXISTS files_on_album_album_id ON files_on_album (album_id);
CREATE INDEX IF NOT EXISTS files_on_album_file_id ON files_on_album (file_id);