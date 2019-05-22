DO
$do$
BEGIN
    IF NOT EXISTS (
        select column_name
        FROM information_schema.columns
        where table_name='person' and column_name='account_id'
    ) THEN
        alter table person add column account_id integer;
    END IF;

    IF NOT EXISTS (
        select column_name
        FROM information_schema.columns
        where table_name='person' and column_name='client_id'
    ) THEN
        alter table person add column client_id integer;
    END IF;
END
$do$
