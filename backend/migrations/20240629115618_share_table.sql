CREATE OR REPLACE FUNCTION increment_access_count() RETURNS TRIGGER
    LANGUAGE plpgsql
AS $$
BEGIN
    NEW.access_count = NEW.access_count + 1;
    RETURN NEW;
END
$$;

CREATE TABLE IF NOT EXISTS shares
(
    id           BIGSERIAL PRIMARY KEY,
    uuid         UUID UNIQUE                                    NOT NULL DEFAULT gen_random_uuid(),
    user_id      BIGINT REFERENCES users (id) ON DELETE CASCADE NOT NULL,

    file_id      BIGINT REFERENCES files (id) ON DELETE CASCADE,
    folder_id    BIGINT REFERENCES folder (id) ON DELETE CASCADE,

    share_type   INT2                                           NOT NULL,
    share_target BIGINT REFERENCES users (id) ON DELETE CASCADE,

    access_limit INT,
    password     TEXT,

    access_count INT DEFAULT 0 NOT NULL,
    last_access  TIMESTAMPTZ,

    created_at   TIMESTAMPTZ                                    NOT NULL DEFAULT now(),
    expires_at   TIMESTAMPTZ,
    updated_at   TIMESTAMPTZ                                    NOT NULL DEFAULT now()
);

CREATE TRIGGER update_share_modtime
    BEFORE UPDATE
    ON shares
    FOR EACH ROW
EXECUTE PROCEDURE update_modified_column();

CREATE TRIGGER increment_access_count
    BEFORE UPDATE OF last_access
    ON shares
    FOR EACH ROW
EXECUTE PROCEDURE increment_access_count();