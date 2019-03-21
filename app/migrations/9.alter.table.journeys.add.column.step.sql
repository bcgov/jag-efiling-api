DO
$do$
BEGIN
    IF NOT EXISTS (
        select column_name 
        FROM information_schema.columns
        where table_name='journey' and column_name='steps'
    ) THEN
        alter table journey add column steps varchar;
    END IF;
END
$do$