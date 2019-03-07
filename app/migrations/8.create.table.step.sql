CREATE TABLE IF NOT EXISTS STEP (
    id SERIAL PRIMARY KEY,
    steptype varchar,
    state varchar,
    journeyid integer REFERENCES journey (id),
    deadline date
);