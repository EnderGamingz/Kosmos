CREATE TABLE IF NOT EXISTS contacts
(
    id         BIGSERIAL PRIMARY KEY,
    user_id_1  BIGINT      NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    user_id_2  BIGINT      NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT contacts_user_id_1_user_id_2_key UNIQUE (user_id_1, user_id_2)
);

CREATE INDEX contacts_user_id_1_idx ON contacts (user_id_1);
CREATE INDEX contacts_user_id_2_idx ON contacts (user_id_2);

CREATE TABLE IF NOT EXISTS contact_requests
(
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT      NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    request_user_id BIGINT      NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    status          VARCHAR(20) NOT NULL,
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER update_contact_requests_modtime
    BEFORE UPDATE
    ON contact_requests
    FOR EACH ROW
EXECUTE PROCEDURE update_modified_column();