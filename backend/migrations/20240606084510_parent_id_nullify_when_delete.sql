BEGIN;

ALTER TABLE files
    DROP CONSTRAINT files_parent_folder_id_fkey;

ALTER TABLE files
    ADD CONSTRAINT files_parent_folder_id_fkey
        FOREIGN KEY (parent_folder_id)
            REFERENCES folder(id)
            ON DELETE SET NULL;

COMMIT;