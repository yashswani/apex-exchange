const express = require('express');
const router = express.Router();
const { getTopLeaderboard } = require('../services/leaderboardService');

router.get('/top', async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : 10;
    const leaderboard = await getTopLeaderboard(limit);
    return res.status(200).json({ leaderboard });
  } catch (err) {
    console.error('Get top leaderboard error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
