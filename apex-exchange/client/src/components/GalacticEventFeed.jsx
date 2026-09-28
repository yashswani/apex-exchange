export default function GalacticEventFeed({ events = [] }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs uppercase tracking-wider font-semibold text-slate-400">Galactic Intelligence Feed</h3>
        <span className="flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse"></span>
          Subspace Relay
        </span>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto max-h-[300px] pr-1">
        {events.length === 0 ? (
          <div className="py-8 text-center text-slate-500 text-xs italic bg-slate-950/50 rounded-lg border border-slate-800/50">
            Monitoring subspace telemetry for galactic events...
          </div>
        ) : (
          events.map((event) => {
            const isNegative = Number(event.impactPercent) < 0;

            return (
              <div
                key={event.id}
                className="bg-slate-950 border border-slate-800/80 border-l-4 border-l-purple-500 rounded-r-lg p-3 shadow-md transition-all duration-300 animate-fadeIn"
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-[10px] font-mono text-purple-400 font-bold uppercase tracking-wider">
                    EVENT TELEMETRY
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">{event.time}</span>
                </div>
                <p className="text-xs text-slate-200 font-medium leading-relaxed">
                  {event.headline}
                </p>
                <div className="mt-2 flex items-center justify-end">
                  <span
                    className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                      isNegative
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    }`}
                  >
                    IMPACT: {event.impactPercent > 0 ? '+' : ''}{event.impactPercent}%
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
