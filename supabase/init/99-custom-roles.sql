-- Set passwords for Supabase internal roles
ALTER ROLE supabase_auth_admin WITH PASSWORD 'postgres' LOGIN;
ALTER ROLE authenticator WITH PASSWORD 'postgres' LOGIN;
