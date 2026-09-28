const { pool } = require('../config/db');
const { updateLeaderboard } = require('../services/leaderboardService');

// Helper to get commodity by symbol
async function getCommodityBySymbol(client, symbol) {
  const { rows } = await client.query(
    'SELECT id, current_price FROM commodities WHERE symbol = $1',
    [symbol]
  );
  return rows[0];
}

// Helper to get (or init) position row
async function getPosition(client, userId, commodityId) {
  const { rows } = await client.query(
    'SELECT quantity, avg_entry_price FROM positions WHERE user_id = $1 AND commodity_id = $2 FOR UPDATE',
    [userId, commodityId]
  );
  if (rows.length === 0) {
    return { quantity: 0, avg_entry_price: 0 };
  }
  return rows[0];
}

exports.placeOrder = async (req, res) => {
  const { commoditySymbol, orderType, quantity } = req.body;
  const userId = req.user.id;
  const validTypes = ['BUY', 'SELL', 'SHORT', 'COVER'];

  // Validation
  if (!commoditySymbol) return res.status(400).json({ error: 'commoditySymbol required' });
  if (!validTypes.includes(orderType)) return res.status(400).json({ error: 'Invalid orderType' });
  const qty = Number(quantity);
  if (isNaN(qty) || qty <= 0) return res.status(400).json({ error: 'quantity must be positive' });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    // Commodity
    const commodity = await getCommodityBySymbol(client, commoditySymbol);
    if (!commodity) { await client.query('ROLLBACK'); return res.status(404).json({ error: 'Commodity not found' }); }
    const commodityId = commodity.id;
    const price = Number(commodity.current_price);
    const totalValue = qty * price;
    // User cash
    const { rows: userRows } = await client.query('SELECT cash_balance FROM users WHERE id = $1 FOR UPDATE', [userId]);
    if (userRows.length === 0) { await client.query('ROLLBACK'); return res.status(404).json({ error: 'User not found' }); }
    let cash = Number(userRows[0].cash_balance);
    // Position
    const pos = await getPosition(client, userId, commodityId);
    let { quantity: posQty, avg_entry_price: posAvg } = pos;
    posQty = Number(posQty);
    posAvg = Number(posAvg);

    // Order logic
    if (orderType === 'BUY') {
      if (cash < totalValue) { await client.query('ROLLBACK'); return res.status(400).json({ error: 'Insufficient funds' }); }
      cash -= totalValue;
      const newQty = posQty + qty;
      const newAvg = newQty === 0 ? 0 : ((posQty * posAvg) + totalValue) / newQty;
      posQty = newQty; posAvg = newAvg;
    } else if (orderType === 'SELL') {
      if (posQty < qty) { await client.query('ROLLBACK'); return res.status(400).json({ error: 'Insufficient position to sell' }); }
      cash += totalValue;
      const newQty = posQty - qty;
      const newAvg = newQty === 0 ? 0 : posAvg;
      posQty = newQty; posAvg = newAvg;
    } else if (orderType === 'SHORT') {
      cash += totalValue;
      const newQty = posQty - qty; // more negative
      const newAvg = newQty === 0 ? 0 : ((Math.abs(posQty) * posAvg) + totalValue) / Math.abs(newQty);
      posQty = newQty; posAvg = newAvg;
    } else if (orderType === 'COVER') {
      if (Math.abs(posQty) < qty) { await client.query('ROLLBACK'); return res.status(400).json({ error: 'Position not large enough to cover' }); }
      if (cash < totalValue) { await client.query('ROLLBACK'); return res.status(400).json({ error: 'Insufficient funds' }); }
      cash -= totalValue;
      const newQty = posQty + qty; // toward zero
      const newAvg = newQty === 0 ? 0 : posAvg;
      posQty = newQty; posAvg = newAvg;
    }

    // Upsert position
    await client.query(`INSERT INTO positions (user_id, commodity_id, quantity, avg_entry_price, updated_at)
      VALUES ($1,$2,$3,$4,NOW())
      ON CONFLICT (user_id, commodity_id) DO UPDATE SET quantity=EXCLUDED.quantity, avg_entry_price=EXCLUDED.avg_entry_price, updated_at=NOW();`,
      [userId, commodityId, posQty, posAvg]);
    // Update user cash
    await client.query('UPDATE users SET cash_balance=$1 WHERE id=$2', [cash, userId]);
    // Insert order record
    const { rows: orderRows } = await client.query(`INSERT INTO orders (user_id, commodity_id, order_type, quantity, price, total_value)
      VALUES ($1,$2,$3,$4,$5,$6) RETURNING *;`, [userId, commodityId, orderType, qty, price, totalValue]);
    await client.query('COMMIT');
    try {
      await updateLeaderboard(userId, req.user.username);
    } catch (lbErr) {
      console.error('Leaderboard update error:', lbErr);
    }
    return res.status(200).json({ order: orderRows[0], newCashBalance: cash, newPosition: { quantity: posQty, avg_entry_price: posAvg } });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Place order error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
};
