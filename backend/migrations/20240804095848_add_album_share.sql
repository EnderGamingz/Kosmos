ALTER TABLE shares
    ADD COLUMN album_id BIGINT REFERENCES albums (id) ON DELETE CASCADE;