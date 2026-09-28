export default function PortfolioPanel({ portfolio }) {
  const cashBalance = portfolio ? Number(portfolio.cashBalance) : 0;
  const netWorth = portfolio ? Number(portfolio.netWorth) : 0;
  const positions = portfolio?.positions || [];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs uppercase tracking-wider font-semibold text-slate-400">Portfolio Overview</h3>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-slate-950 border border-slate-800/80 rounded-lg p-3">
          <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Cash Balance</span>
          <p className="text-xl font-mono font-bold text-white mt-1">
            ${cashBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>

        <div className="bg-slate-950 border border-slate-800/80 rounded-lg p-3">
          <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Net Worth</span>
          <p className="text-xl font-mono font-bold text-cyan-400 mt-1">
            ${netWorth.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      <h4 className="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-3">Open Positions</h4>

      <div className="flex-1 overflow-x-auto">
        {positions.length === 0 ? (
          <div className="py-8 text-center text-slate-500 text-xs italic bg-slate-950/50 rounded-lg border border-slate-800/50">
            No open positions yet. Select a commodity above to trade.
          </div>
        ) : (
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-500 uppercase text-[10px]">
                <th className="pb-2 font-semibold">Asset</th>
                <th className="pb-2 font-semibold text-right">Qty</th>
                <th className="pb-2 font-semibold text-right">Avg Entry</th>
                <th className="pb-2 font-semibold text-right">Price</th>
                <th className="pb-2 font-semibold text-right">Unrealized P&L</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50 text-slate-200">
              {positions.map((pos) => {
                const qty = Number(pos.quantity);
                const avgEntry = Number(pos.avgEntryPrice);
                const currentPrice = Number(pos.currentPrice);
                const pnl = Number(pos.unrealizedPnL);
                const isPositive = pnl >= 0;

                return (
                  <tr key={pos.commodityId} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-2.5 font-bold text-slate-100">{pos.symbol}</td>
                    <td className={`py-2.5 text-right font-bold ${qty < 0 ? 'text-rose-400' : 'text-slate-200'}`}>
                      {qty}
                    </td>
                    <td className="py-2.5 text-right text-slate-400">${avgEntry.toFixed(2)}</td>
                    <td className="py-2.5 text-right text-slate-300">${currentPrice.toFixed(2)}</td>
                    <td className={`py-2.5 text-right font-semibold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {isPositive ? '+' : ''}${pnl.toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
