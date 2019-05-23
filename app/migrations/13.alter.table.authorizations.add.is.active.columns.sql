DO
$do$
BEGIN
    IF NOT EXISTS (
        select column_name
        FROM information_schema.columns
        where table_name='authorizations' and column_name='is_active'
    ) THEN
        alter table authorizations add column is_active boolean;
    END IF;
END
$do$
