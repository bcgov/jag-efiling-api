DO
$do$
BEGIN
    IF NOT EXISTS (
        select column_name 
        FROM information_schema.columns 
        where table_name='forms' and column_name='person_id'
    ) THEN
        alter table forms add column person_id integer;
    END IF;
END
$do$
;

