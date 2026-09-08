-- Run this SQL in the Vercel Postgres dashboard (Storage → Postgres → Query)
-- после создания базы данных

CREATE TABLE IF NOT EXISTS app_data (
  id TEXT PRIMARY KEY DEFAULT 'main',
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Вставляем начальную запись, если её нет
INSERT INTO app_data (id, data)
VALUES ('main', '{"subjects":[],"tasks":[]}'::jsonb)
ON CONFLICT (id) DO NOTHING;