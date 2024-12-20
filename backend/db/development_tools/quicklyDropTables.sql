-- Run this script in PostgreSQL so I don't have to run db:rollback 11 times in a row every time I change things.
-- It will drop all tables in the development database so I can rerun db:migrate to regenerate them.

DO $$ DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.tablename) || ' CASCADE';
    END LOOP;
END $$;
