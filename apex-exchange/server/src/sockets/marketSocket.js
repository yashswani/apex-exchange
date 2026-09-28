function initMarketSocket(io) {
  io.on('connection', (socket) => {
    console.log('🔌 Client connected:', socket.id);
    socket.on('disconnect', () => {
      console.log('🔌 Client disconnected:', socket.id);
    });
  });
}

function broadcastPrices(io, commodities) {
  if (io) {
    io.emit('prices:update', commodities);
  }
}

function broadcastLeaderboard(io, leaderboard) {
  if (io) {
    io.emit('leaderboard:update', leaderboard);
  }
}

function broadcastGalacticEvent(io, eventInfo) {
  if (io) {
    io.emit('galactic:event', eventInfo);
  }
}

module.exports = {
  initMarketSocket,
  broadcastPrices,
  broadcastLeaderboard,
  broadcastGalacticEvent
};
