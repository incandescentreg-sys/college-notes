import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    await sql`CREATE TABLE IF NOT EXISTS app_data (
      id TEXT PRIMARY KEY DEFAULT 'main',
      data JSONB NOT NULL DEFAULT '{}'::jsonb,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )`;

    if (req.method === 'GET') {
      const { rows } = await sql`SELECT data FROM app_data WHERE id = 'main'`;
      if (rows.length === 0) return res.json({ subjects: [], tasks: [] });
      return res.json(rows[0].data);
    }

    if (req.method === 'PUT') {
      const payload = JSON.stringify(req.body);
      await sql`INSERT INTO app_data (id, data) VALUES ('main', ${payload}::jsonb)
                ON CONFLICT (id) DO UPDATE SET data = ${payload}::jsonb, updated_at = NOW()`;
      return res.json({ ok: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('API error:', err);
    return res.status(500).json({ error: err.message });
  }
}
