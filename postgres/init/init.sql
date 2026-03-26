CREATE DATABASE messenger_db;
CREATE USER messenger_admin WITH ENCRYPTED PASSWORD 'messenger_admin';
GRANT ALL PRIVILEGES ON DATABASE messenger_db TO messenger_admin;

\connect messenger_db

ALTER SCHEMA public OWNER TO messenger_admin;
GRANT USAGE ON SCHEMA pg_catalog TO messenger_admin;
GRANT SELECT ON ALL TABLES IN SCHEMA pg_catalog TO messenger_admin;
GRANT USAGE ON SCHEMA public TO messenger_admin;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO messenger_admin;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON TABLES TO messenger_admin;


CREATE DATABASE auth_db;
CREATE USER auth_admin WITH ENCRYPTED PASSWORD 'auth_admin';
GRANT ALL PRIVILEGES ON DATABASE auth_db TO auth_admin;

\connect auth_db

ALTER SCHEMA public OWNER TO auth_admin;
GRANT USAGE ON SCHEMA pg_catalog TO auth_admin;
GRANT SELECT ON ALL TABLES IN SCHEMA pg_catalog TO auth_admin;
GRANT USAGE ON SCHEMA public TO auth_admin;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO auth_admin;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON TABLES TO auth_admin;
