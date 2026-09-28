import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useMarketData } from '../hooks/useMarketData';
import { usePortfolio } from '../hooks/usePortfolio';
import { useLeaderboard } from '../hooks/useLeaderboard';

import CommodityCard from '../components/CommodityCard';
import PriceChart from '../components/PriceChart';
import TradePanel from '../components/TradePanel';
import PortfolioPanel from '../components/PortfolioPanel';
import LeaderboardPanel from '../components/LeaderboardPanel';
import GalacticEventFeed from '../components/GalacticEventFeed';

const DEFAULT_COMMODITIES = [
  { id: 1, symbol: 'QFUEL', current_price: 120.00 },
  { id: 2, symbol: 'DMO', current_price: 450.00 },
  { id: 3, symbol: 'BIOS', current_price: 75.00 },
  { id: 4, symbol: 'TGRN', current_price: 18.00 }
];

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const { commodities, priceHistory, recentEvents } = useMarketData();
  const { portfolio, refetch: refetchPortfolio } = usePortfolio();
  const { leaderboard } = useLeaderboard();

  const [selectedSymbol, setSelectedSymbol] = useState('QFUEL');

  const activeCommodities = commodities.length > 0 ? commodities : DEFAULT_COMMODITIES;

  const selectedCommodity = activeCommodities.find(c => c.symbol === selectedSymbol) || activeCommodities[0];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Header */}
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center font-black text-cyan-400">
            A
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-cyan-400 tracking-wider">APEX EXCHANGE</h1>
            <p className="text-[10px] uppercase font-mono text-slate-400">Galactic Commodity Trading Terminal</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <span className="text-xs text-slate-500 block">Clearance Holder</span>
            <span className="text-sm font-bold text-slate-200">{user?.username}</span>
          </div>
          <button
            onClick={handleLogout}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-semibold text-xs px-4 py-2 rounded-lg transition-colors"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Dashboard Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">

        {/* Commodity Cards Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {activeCommodities.map((com) => (
            <CommodityCard
              key={com.symbol}
              commodity={com}
              priceHistory={priceHistory[com.symbol]}
              onSelect={(sym) => setSelectedSymbol(sym)}
              isSelected={selectedSymbol === com.symbol}
            />
          ))}
        </section>

        {/* Chart & Trade Section */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <PriceChart
              symbol={selectedCommodity?.symbol}
              data={priceHistory[selectedCommodity?.symbol] || []}
            />
          </div>
          <div className="lg:col-span-1">
            <TradePanel
              selectedCommodity={selectedCommodity}
              onOrderPlaced={refetchPortfolio}
            />
          </div>
        </section>

        {/* Portfolio, Leaderboard & Event Feed Section */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <PortfolioPanel portfolio={portfolio} />
          </div>
          <div>
            <LeaderboardPanel leaderboard={leaderboard} currentUserId={user?.id} />
          </div>
          <div>
            <GalacticEventFeed events={recentEvents} />
          </div>
        </section>

      </main>
    </div>
  );
}
