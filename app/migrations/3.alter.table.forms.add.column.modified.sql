DO
$do$
BEGIN
    IF NOT EXISTS (
        select column_name 
        FROM information_schema.columns 
        where table_name='forms' and column_name='modified'
    ) THEN
        alter table forms add column modified timestamp default current_timestamp;
    END IF;
END
$do$
;

