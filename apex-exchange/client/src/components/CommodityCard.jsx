const COMMODITY_NAMES = {
  QFUEL: 'Quantum Fuel',
  DMO: 'Dark Matter Ore',
  BIOS: 'Bio-Synthetics',
  TGRN: 'Terran Grains'
};

export default function CommodityCard({ commodity, priceHistory = [], onSelect, isSelected }) {
  const symbol = commodity.symbol;
  const currentPrice = Number(commodity.current_price);
  const name = COMMODITY_NAMES[symbol] || symbol;

  const history = priceHistory || [];
  let changePct = 0;
  if (history.length >= 2) {
    const prevPrice = history[history.length - 2].price;
    if (prevPrice > 0) {
      changePct = ((currentPrice - prevPrice) / prevPrice) * 100;
    }
  }

  const isPositive = changePct >= 0;
  const changeFormatted = `${isPositive ? '+' : ''}${changePct.toFixed(2)}%`;

  return (
    <div
      onClick={() => onSelect(symbol)}
      className={`cursor-pointer transition-all duration-200 bg-slate-900 border rounded-xl p-4 shadow-lg hover:border-slate-700 ${
        isSelected
          ? 'border-cyan-500 ring-2 ring-cyan-500/20 bg-slate-900/90'
          : 'border-slate-800'
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-300">
          {symbol}
        </span>
        <span
          className={`text-xs font-semibold px-2 py-0.5 rounded ${
            isPositive
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
          }`}
        >
          {changeFormatted}
        </span>
      </div>

      <div className="text-sm text-slate-400 truncate mb-3">{name}</div>

      <div className="text-2xl font-mono font-extrabold text-white">
        ${currentPrice.toFixed(2)}
      </div>
    </div>
  );
}
