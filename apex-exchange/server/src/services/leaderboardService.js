const { pool } = require('../config/db');
const redis = require('../config/redis');

async function calculateNetWorth(userId) {
  const { rows: userRows } = await pool.query(
    'SELECT cash_balance FROM users WHERE id = $1',
    [userId]
  );
  if (userRows.length === 0) return 0;
  const cashBalance = Number(userRows[0].cash_balance);

  const { rows: posRows } = await pool.query(
    `SELECT p.quantity, c.current_price
     FROM positions p
     JOIN commodities c ON p.commodity_id = c.id
     WHERE p.user_id = $1 AND p.quantity != 0`,
    [userId]
  );

  let positionsValueTotal = 0;
  for (const pos of posRows) {
    positionsValueTotal += Number(pos.quantity) * Number(pos.current_price);
  }

  const netWorth = Math.round((cashBalance + positionsValueTotal) * 100) / 100;
  return netWorth;
}

async function updateLeaderboard(userId, username) {
  const netWorth = await calculateNetWorth(userId);
  await redis.zadd('leaderboard', netWorth, userId.toString());
  await redis.hset('leaderboard:usernames', userId.toString(), username);
  return netWorth;
}

async function getTopLeaderboard(limit = 10) {
  const rawResults = await redis.zrevrange('leaderboard', 0, limit - 1, 'WITHSCORES');
  const leaderboard = [];

  for (let i = 0; i < rawResults.length; i += 2) {
    const userId = rawResults[i];
    const score = Number(rawResults[i + 1]);
    const rank = Math.floor(i / 2) + 1;
    const username = await redis.hget('leaderboard:usernames', userId);

    leaderboard.push({
      rank,
      userId: Number(userId),
      username: username || 'Unknown',
      netWorth: score
    });
  }

  return leaderboard;
}

module.exports = {
  calculateNetWorth,
  updateLeaderboard,
  getTopLeaderboard
};
