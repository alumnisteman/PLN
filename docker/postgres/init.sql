-- Smart Construction ERP - Initial Database Setup
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";

-- Enable row-level security
ALTER DATABASE erp_db SET log_statement = 'none';

COMMENT ON DATABASE erp_db IS 'Smart Construction ERP Database';
