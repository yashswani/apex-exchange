const { pool } = require('../config/db');

exports.getPortfolio = async (req, res) => {
  const userId = req.user.id;

  try {
    // 1. Fetch user's cash balance
    const { rows: userRows } = await pool.query(
      'SELECT cash_balance FROM users WHERE id = $1',
      [userId]
    );

    if (userRows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const cashBalance = Number(userRows[0].cash_balance);

    // 2. Fetch positions joined with commodities where quantity != 0
    const { rows: posRows } = await pool.query(
      `SELECT p.commodity_id, c.symbol, c.name, p.quantity, p.avg_entry_price, c.current_price
       FROM positions p
       JOIN commodities c ON p.commodity_id = c.id
       WHERE p.user_id = $1 AND p.quantity != 0`,
      [userId]
    );

    let positionsValueTotal = 0;

    const positions = posRows.map((row) => {
      const quantity = Number(row.quantity);
      const avgEntryPrice = Number(row.avg_entry_price);
      const currentPrice = Number(row.current_price);
      const currentValue = Math.abs(quantity) * currentPrice;

      let unrealizedPnL = 0;
      if (quantity > 0) {
        unrealizedPnL = (currentPrice - avgEntryPrice) * quantity;
      } else if (quantity < 0) {
        unrealizedPnL = (avgEntryPrice - currentPrice) * Math.abs(quantity);
      }

      positionsValueTotal += quantity * currentPrice;

      return {
        commodityId: row.commodity_id,
        symbol: row.symbol,
        name: row.name,
        quantity,
        avgEntryPrice,
        currentPrice,
        currentValue: Math.round(currentValue * 100) / 100,
        unrealizedPnL: Math.round(unrealizedPnL * 100) / 100
      };
    });

    const netWorth = Math.round((cashBalance + positionsValueTotal) * 100) / 100;

    return res.status(200).json({
      cashBalance,
      netWorth,
      positions
    });
  } catch (err) {
    console.error('Get portfolio error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
