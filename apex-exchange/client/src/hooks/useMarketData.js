import { useState, useEffect } from 'react';
import { socket } from '../lib/socket';

export function useMarketData() {
  const [commodities, setCommodities] = useState([]);
  const [priceHistory, setPriceHistory] = useState({});
  const [recentEvents, setRecentEvents] = useState([]);

  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }

    const handlePricesUpdate = (updatedCommodities) => {
      setCommodities(updatedCommodities);

      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

      setPriceHistory((prev) => {
        const next = { ...prev };
        for (const item of updatedCommodities) {
          const sym = item.symbol;
          const current = next[sym] || [];
          const newPoint = { time: timeStr, price: Number(item.current_price) };
          const updatedList = [...current, newPoint];

          if (updatedList.length > 30) {
            next[sym] = updatedList.slice(updatedList.length - 30);
          } else {
            next[sym] = updatedList;
          }
        }
        return next;
      });
    };

    const handleGalacticEvent = (eventData) => {
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const eventWithTime = {
        ...eventData,
        id: Date.now() + Math.random(),
        time: timeStr
      };

      setRecentEvents((prev) => [eventWithTime, ...prev].slice(0, 5));
    };

    socket.on('prices:update', handlePricesUpdate);
    socket.on('galactic:event', handleGalacticEvent);

    return () => {
      socket.off('prices:update', handlePricesUpdate);
      socket.off('galactic:event', handleGalacticEvent);
    };
  }, []);

  return { commodities, priceHistory, recentEvents };
}
