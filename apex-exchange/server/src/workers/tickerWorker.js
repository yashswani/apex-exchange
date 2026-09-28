let tickerStarted = false;
let ioInstance = null;
const { pool } = require('../config/db');
const { broadcastPrices, broadcastGalacticEvent } = require('../sockets/marketSocket');

// Helper to get random number between min and max (inclusive of min, exclusive of max)
function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

// Headline templates for galactic events
const headlineTemplates = [
  '{commodity} boom as asteroid mining surge — prices rise {percent}%',
  '{commodity} suffers from wormhole trade disruption — prices drop {percent}%',
  '{commodity} hit by pirate raids on trade routes — prices {percent}% today',
  '{commodity} embargo imposed by planetary council — prices fall {percent}%',
  '{commodity} discovery of new deposit on distant moon — prices jump {percent}%',
  '{commodity} sudden solar flare affects extraction — prices {percent}%'
];

/**
 * Perform a single price tick for all commodities.
 * All DB operations occur within a single transaction.
 */
async function tickPrices() {
  const tickTime = new Date();
  try {
    await pool.query('BEGIN');

    // 1. Fetch all commodities
    const { rows: commodities } = await pool.query('SELECT id, symbol, current_price FROM commodities');

    // Determine if a galactic event occurs this tick (10% chance)
    const eventOccurs = Math.random() < 0.1;
    let eventInfo = null;
    if (eventOccurs && commodities.length > 0) {
      const eventCommodity = commodities[Math.floor(Math.random() * commodities.length)];
      const impactPercent = Math.round(randomBetween(-35, 35)); // integer percent
      const template = headlineTemplates[Math.floor(Math.random() * headlineTemplates.length)];
      const headline = template.replace('{commodity}', eventCommodity.symbol).replace('{percent}', Math.abs(impactPercent));
      eventInfo = { commodityId: eventCommodity.id, impactPercent, headline };
      // Insert galactic event row
      await pool.query(
        'INSERT INTO galactic_events (headline, commodity_id, price_impact_percent) VALUES ($1, $2, $3)',
        [headline, eventInfo.commodityId, eventInfo.impactPercent]
      );
    }

    const summaryParts = [];
    const updatedCommodities = [];

    // 2. Process each commodity
    for (const com of commodities) {
      let newPrice = com.current_price * (1 + randomBetween(-0.03, 0.03));
      if (eventInfo && com.id === eventInfo.commodityId) {
        newPrice = newPrice * (1 + eventInfo.impactPercent / 100);
      }
      if (newPrice < 1) newPrice = 1;
      newPrice = Math.round(newPrice * 10000) / 10000; // 4 decimals
      const changePct = ((newPrice - com.current_price) / com.current_price) * 100;
      const sign = changePct >= 0 ? '+' : '';
      summaryParts.push(`${com.symbol} ${newPrice.toFixed(4)} (${sign}${changePct.toFixed(1)}%)`);
      updatedCommodities.push({ id: com.id, symbol: com.symbol, current_price: newPrice });

      // Update commodity price
      await pool.query('UPDATE commodities SET current_price = $1 WHERE id = $2', [newPrice, com.id]);

      // Insert price history
      await pool.query('INSERT INTO price_history (commodity_id, price) VALUES ($1, $2)', [com.id, newPrice]);
    }

    await pool.query('COMMIT');

    // Broadcast via socket
    if (ioInstance) {
      broadcastPrices(ioInstance, updatedCommodities);
      if (eventInfo) {
        broadcastGalacticEvent(ioInstance, eventInfo);
      }
    }

    // Log tick summary
    const timeStr = tickTime.toTimeString().split(' ')[0];
    console.log(`[TICK ${timeStr}] ${summaryParts.join(' | ')}`);
    if (eventInfo) {
      console.log(`*** GALACTIC EVENT *** ${eventInfo.headline} (impact ${eventInfo.impactPercent}%)`);
    }
  } catch (err) {
    await pool.query('ROLLBACK');
    console.error('Ticker tick error:', err);
  }
}

/**
 * Starts the ticker loop.
 * Executes tickPrices immediately, then schedules the next tick after a random delay (5‑10 s).
 */
function startTicker(io) {
  if (io) {
    ioInstance = io;
  }
  if (tickerStarted) {
    console.warn('⚠️ Ticker already running, skipping duplicate start');
    return;
  }
  tickerStarted = true;
  console.log('🚀 Galactic ticker started');
  const runTick = async () => {
    try {
      await tickPrices();
    } catch (e) {
      console.error('Unexpected ticker error:', e);
    }
    const nextDelay = Math.floor(randomBetween(5000, 10000));
    setTimeout(runTick, nextDelay);
  };
  // Kick off first tick immediately
  runTick();
}

module.exports = { startTicker };
