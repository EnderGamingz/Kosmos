CREATE TABLE IF NOT EXISTS image_formats
(
    id         BIGINT PRIMARY KEY,
    format     int2        NOT NULL,
    file_id    BIGINT      NOT NULL REFERENCES files (id) ON DELETE CASCADE,
    width      INT         NOT NULL,
    height     INT         NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);