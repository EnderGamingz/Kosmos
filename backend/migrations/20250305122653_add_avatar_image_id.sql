ALTER TABLE users
    ADD COLUMN avatar_image_id BIGINT REFERENCES files (id) ON DELETE SET NULL;


CREATE OR REPLACE FUNCTION check_avatar_image_id_type()
    RETURNS TRIGGER AS
$$
BEGIN
    IF NEW.avatar_image_id IS NOT NULL THEN
        IF NOT EXISTS (SELECT 1 FROM files WHERE id = NEW.avatar_image_id AND file_type = 1) THEN
            RAISE EXCEPTION 'avatar_image_id must reference a file with file_type image';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER before_avatar_image_id_set
    BEFORE UPDATE OF avatar_image_id ON users
    FOR EACH ROW
    EXECUTE FUNCTION check_avatar_image_id_type();