import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function PriceChart({ symbol, data = [] }) {
  const hasData = data && data.length > 0;
  const prices = hasData ? data.map(d => d.price) : [0];
  const minPrice = hasData ? Math.min(...prices) : 0;
  const maxPrice = hasData ? Math.max(...prices) : 100;
  const padding = (maxPrice - minPrice) * 0.1 || 1;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col h-[360px]">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xs uppercase tracking-wider font-semibold text-slate-400">Market Price History</h3>
          <p className="text-xl font-bold text-cyan-400">{symbol || 'Select Commodity'}</p>
        </div>
        {hasData && (
          <div className="text-right">
            <span className="text-xs text-slate-500">Latest</span>
            <p className="text-lg font-mono font-semibold text-slate-200">
              ${data[data.length - 1].price.toFixed(2)}
            </p>
          </div>
        )}
      </div>

      <div className="flex-1 w-full min-h-0">
        {!hasData ? (
          <div className="h-full flex items-center justify-center text-slate-500 text-sm italic">
            Awaiting price tick data...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis
                dataKey="time"
                stroke="#64748b"
                tick={{ fill: '#64748b', fontSize: 11 }}
                tickLine={false}
              />
              <YAxis
                domain={[Math.max(0, Math.floor(minPrice - padding)), Math.ceil(maxPrice + padding)]}
                stroke="#64748b"
                tick={{ fill: '#64748b', fontSize: 11 }}
                tickLine={false}
                tickFormatter={(v) => `$${v}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '8px',
                  color: '#f8fafc',
                  fontSize: '12px'
                }}
                formatter={(value) => [`$${Number(value).toFixed(4)}`, 'Price']}
              />
              <Line
                type="monotone"
                dataKey="price"
                stroke="#06b6d4"
                strokeWidth={2}
                dot={{ fill: '#06b6d4', r: 3 }}
                activeDot={{ r: 5, fill: '#38bdf8' }}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
