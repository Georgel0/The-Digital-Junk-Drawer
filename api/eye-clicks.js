import sql from '../lib/db.js';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const rows = await sql`
        SELECT value FROM counters WHERE key = 'global_eye_clicks'
      `;
      const count = rows[0]?.value ?? 0;
      return res.status(200).json({ count });
    } catch (error) {
      return res.status(500).json({ error: 'Failed to fetch count' });
    }
  }

  if (req.method === 'POST') {
    try {
      const rows = await sql`
        INSERT INTO counters (key, value) VALUES ('global_eye_clicks', 1)
        ON CONFLICT (key) DO UPDATE SET value = counters.value + 1
        RETURNING value
      `;
      return res.status(200).json({ count: rows[0].value });
    } catch (error) {
      return res.status(500).json({ error: 'Failed to update count' });
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}