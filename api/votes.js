import redis from '../lib/redis.js';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      res.setHeader('Cache-Control', 'no-store, max-age=0');
      
      const votes = await redis.hgetall('project_votes');
      return res.status(200).json(votes || {});
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
      const newTotal = await redis.hincrby('project_votes', id, action);
      return res.status(200).json({ id, votes: newTotal });
    } catch (error) {
      return res.status(500).json({ error: 'Failed to update vote' });
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}