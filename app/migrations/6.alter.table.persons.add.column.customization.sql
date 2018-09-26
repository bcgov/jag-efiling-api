DO
$do$
BEGIN
    IF NOT EXISTS (
        select column_name 
        FROM information_schema.columns 
        where table_name='person' and column_name='customization'
    ) THEN
        alter table person add column customization varchar;
    END IF;
END
$do$
;

