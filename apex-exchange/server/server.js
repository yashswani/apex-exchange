require('dotenv').config();
require('./src/config/db');
require('./src/config/redis');
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const { initMarketSocket } = require('./src/sockets/marketSocket');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/trade', require('./src/routes/tradeRoutes'));
app.use('/api/leaderboard', require('./src/routes/leaderboardRoutes'));

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

initMarketSocket(io);

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
  const { startTicker } = require('./src/workers/tickerWorker');
  startTicker(io);
});
