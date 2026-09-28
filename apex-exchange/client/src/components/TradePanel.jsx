import { useState } from 'react';
import api from '../lib/api';

const ORDER_TYPES = ['BUY', 'SELL', 'SHORT', 'COVER'];

export default function TradePanel({ selectedCommodity, onOrderPlaced }) {
  const [orderType, setOrderType] = useState('BUY');
  const [quantity, setQuantity] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const currentPrice = selectedCommodity ? Number(selectedCommodity.current_price) : 0;
  const qtyNum = Number(quantity) || 0;
  const totalCost = (qtyNum * currentPrice).toFixed(2);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCommodity) return;

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await api.post('/api/trade/order', {
        commoditySymbol: selectedCommodity.symbol,
        orderType,
        quantity: qtyNum
      });

      setSuccess(`Order Executed! ${orderType} ${qtyNum} ${selectedCommodity.symbol} @ $${currentPrice.toFixed(2)}`);
      setQuantity('');
      if (onOrderPlaced) onOrderPlaced();
    } catch (err) {
      console.error('Trade execution error:', err);
      const msg = err.response?.data?.error || 'Order execution failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs uppercase tracking-wider font-semibold text-slate-400">Execute Order</h3>
          <span className="text-sm font-bold text-cyan-400">{selectedCommodity?.symbol || 'N/A'}</span>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-lg">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs rounded-lg">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-4 gap-2">
            {ORDER_TYPES.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setOrderType(type)}
                className={`py-2 text-xs font-bold rounded-lg border transition-colors ${
                  orderType === type
                    ? 'bg-cyan-600 text-white border-cyan-500 shadow-md shadow-cyan-600/20'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          <div>
            <label className="block text-xs uppercase font-semibold text-slate-400 mb-1">Quantity</label>
            <input
              type="number"
              min="0.0001"
              step="any"
              required
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white font-mono placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition-colors"
              placeholder="0.00"
            />
          </div>

          <div className="bg-slate-950 border border-slate-800/80 rounded-lg p-3 flex justify-between items-center text-xs">
            <span className="text-slate-400">Estimated Total</span>
            <span className="font-mono font-bold text-white text-sm">${totalCost}</span>
          </div>

          <button
            type="submit"
            disabled={loading || !selectedCommodity || qtyNum <= 0}
            className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-semibold py-3 rounded-lg transition-colors shadow-lg shadow-cyan-600/20 disabled:opacity-50"
          >
            {loading ? 'Processing Order...' : `Submit ${orderType} Order`}
          </button>
        </form>
      </div>
    </div>
  );
}
