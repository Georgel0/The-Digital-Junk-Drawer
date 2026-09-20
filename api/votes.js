import sql from '../lib/db.js';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      res.setHeader('Cache-Control', 'no-store, max-age=0');

      const rows = await sql`SELECT project_id, votes FROM project_votes`;
      const votes = {};
      for (const row of rows) votes[row.project_id] = row.votes;
      return res.status(200).json(votes);
    } catch (error) {
      return res.status(500).json({ error: 'Failed to fetch votes' });
    }
  }

  if (req.method === 'POST') {
    try {
      const { id, action } = req.body;
      if (!id || (action !== 1 && action !== -1)) {
        return res.status(400).json({ error: 'Invalid request' });
      }

      const rows = await sql`
        INSERT INTO project_votes (project_id, votes) VALUES (${id}, ${action})
        ON CONFLICT (project_id) DO UPDATE SET votes = project_votes.votes + ${action}
        RETURNING votes
      `;
      return res.status(200).json({ id, votes: rows[0].votes });
    } catch (error) {
      return res.status(500).json({ error: 'Failed to update vote' });
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}