export default function LeaderboardPanel({ leaderboard = [], currentUserId }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs uppercase tracking-wider font-semibold text-slate-400">Galactic Leaderboard</h3>
        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
          Live Rankings
        </span>
      </div>

      <div className="flex-1 overflow-x-auto">
        {leaderboard.length === 0 ? (
          <div className="py-8 text-center text-slate-500 text-xs italic bg-slate-950/50 rounded-lg border border-slate-800/50">
            No rankings logged yet.
          </div>
        ) : (
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-500 uppercase text-[10px]">
                <th className="pb-2 font-semibold text-center w-10">Rank</th>
                <th className="pb-2 font-semibold">Trader</th>
                <th className="pb-2 font-semibold text-right">Net Worth</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {leaderboard.map((item) => {
                const isCurrent = item.userId === Number(currentUserId);
                const rankColor =
                  item.rank === 1
                    ? 'text-amber-400 font-extrabold'
                    : item.rank === 2
                    ? 'text-slate-300 font-bold'
                    : item.rank === 3
                    ? 'text-amber-600 font-bold'
                    : 'text-slate-500';

                return (
                  <tr
                    key={item.userId}
                    className={`transition-colors ${
                      isCurrent
                        ? 'bg-cyan-500/10 border-l-2 border-l-cyan-400 text-cyan-200'
                        : 'hover:bg-slate-800/30 text-slate-300'
                    }`}
                  >
                    <td className={`py-2.5 text-center ${rankColor}`}>#{item.rank}</td>
                    <td className="py-2.5 font-semibold flex items-center gap-1.5">
                      {item.username}
                      {isCurrent && (
                        <span className="text-[9px] uppercase px-1.5 py-0.2 bg-cyan-500/20 text-cyan-300 rounded border border-cyan-400/30">
                          YOU
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 text-right font-bold text-white">
                      ${Number(item.netWorth).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
