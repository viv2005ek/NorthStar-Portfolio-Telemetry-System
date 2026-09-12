-- Database schema and seed data for Northstar Portfolio

CREATE TABLE IF NOT EXISTS tenants (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS holdings (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    holding_date DATE NOT NULL,
    ticker VARCHAR(50) NOT NULL,
    asset_class VARCHAR(100) NOT NULL,
    quantity NUMERIC NOT NULL,
    price NUMERIC NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_holdings_tenant_date
ON holdings(tenant_id, holding_date);

-- Seed tenants
INSERT INTO tenants (id, name)
VALUES
    (1, 'Alpha Capital'),
    (2, 'Beacon Advisors')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- Seed users (password for both is Password123!)
INSERT INTO users (email, password_hash, tenant_id)
VALUES
    ('tenant_a@example.com', '$2a$10$5Xunez.Hr35NyqwOI1taFeguAoEhudMao6vz27MBguzjqIEBQWNXS', 1),
    ('tenant_b@example.com', '$2a$10$5Xunez.Hr35NyqwOI1taFeguAoEhudMao6vz27MBguzjqIEBQWNXS', 2)
ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, tenant_id = EXCLUDED.tenant_id;

-- Reset tenant sequence past manually inserted IDs
SELECT setval('tenants_id_seq', (SELECT MAX(id) FROM tenants));

