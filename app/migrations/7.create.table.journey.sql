CREATE TABLE IF NOT EXISTS JOURNEY (
    id SERIAL PRIMARY KEY,
    userid integer REFERENCES person (id),
    type varchar,
    state varchar,
    ca_number varchar
);