CREATE TABLE IF NOT EXISTS push_subscriptions
(
    id         BIGSERIAL PRIMARY KEY                          NOT NULL,
    user_id    BIGINT REFERENCES users (id) ON DELETE CASCADE NOT NULL,
    name       TEXT                                           NOT NULL,
    endpoint   TEXT                                           NOT NULL,
    p256dh     TEXT                                           NOT NULL,
    auth       TEXT                                           NOT NULL,

    created_at TIMESTAMPTZ                                    NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ                                    NOT NULL DEFAULT now()
);

CREATE TRIGGER update_push_subscriptions_modtime
    BEFORE UPDATE
    ON push_subscriptions
    FOR EACH ROW
EXECUTE PROCEDURE update_modified_column();
