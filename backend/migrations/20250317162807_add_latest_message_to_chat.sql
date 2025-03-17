ALTER TABLE chats
    ADD COLUMN latest_message_at TIMESTAMPTZ DEFAULT now();