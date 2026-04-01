'use client'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import {
  openPositions,
  closedPositions,
  portfolioHistory,
  STARTING_BANKROLL,
  CURRENT_VALUE,
} from '@/data/portfolio'

function PnL({ cost, current, contracts }: { cost: number; current: number; contracts: number }) {
  const unrealized = (current - cost) * contracts
  const pct = ((current - cost) / cost) * 100
  const pos = unrealized >= 0
  return (
    <div className={pos ? 'text-emerald-400' : 'text-red-400'}>
      <div className="font-mono font-bold">{pos ? '+' : ''}${unrealized.toFixed(2)}</div>
      <div className="text-xs opacity-70">{pos ? '+' : ''}{pct.toFixed(1)}%</div>
    </div>
  )
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#111827] border border-gray-700 rounded px-3 py-2 text-xs">
        <div className="text-gray-400 mb-1">{label}</div>
        <div className="text-emerald-400 font-mono font-bold">${payload[0].value}</div>
      </div>
    )
  }
  return null
}

export default function Portfolio() {
  const totalReturn = ((CURRENT_VALUE - STARTING_BANKROLL) / STARTING_BANKROLL) * 100
  const totalPnL = CURRENT_VALUE - STARTING_BANKROLL

  const openPnL = openPositions.reduce((sum, p) => {
    return sum + (p.currentPrice - p.avgCost) * p.contracts
  }, 0)

  const closedPnL = closedPositions.reduce((sum, p) => {
    const exit = p.result === 'WIN' ? 1.0 : 0.0
    return sum + (exit - p.avgCost) * p.contracts
  }, 0)

  const wins = closedPositions.filter((p) => p.result === 'WIN').length
  const winRate = (wins / closedPositions.length) * 100

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-100">Portfolio Tracker</h1>
        <p className="text-sm text-gray-500 mt-0.5">Mock positions · paper trading mode</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Starting Bankroll', value: `$${STARTING_BANKROLL.toLocaleString()}`, color: 'text-gray-200' },
          { label: 'Current Value', value: `$${CURRENT_VALUE.toLocaleString()}`, color: 'text-emerald-400' },
          { label: 'Total Return', value: `+${totalReturn.toFixed(1)}%`, color: 'text-emerald-400' },
          { label: 'Win Rate', value: `${winRate.toFixed(0)}%`, color: 'text-yellow-400' },
        ].map((s) => (
          <div key={s.label} className="bg-[#111827] border border-gray-800 rounded-lg p-4">
            <div className="text-xs text-gray-500 mb-1">{s.label}</div>
            <div className={`text-2xl font-bold font-mono ${s.color}`}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="bg-[#111827] border border-gray-800 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-300">Portfolio Value (7d)</h2>
          <span className={`text-sm font-mono font-bold ${totalPnL >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {totalPnL >= 0 ? '+' : ''}${totalPnL.toFixed(2)} ({totalReturn.toFixed(1)}%)
          </span>
        </div>
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={portfolioHistory}>
              <defs>
                <linearGradient id="greenGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} domain={['auto', 'auto']} />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#10b981"
                strokeWidth={2}
                fill="url(#greenGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Open Positions */}
      <div className="bg-[#111827] border border-gray-800 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-300">Open Positions</h2>
          <div className="flex items-center gap-2">
            <span className={`text-sm font-mono font-bold ${openPnL >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              Unrealized: {openPnL >= 0 ? '+' : ''}${openPnL.toFixed(2)}
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-500 border-b border-gray-800">
                <th className="text-left pb-2 font-medium">Market</th>
                <th className="text-center pb-2 font-medium">Side</th>
                <th className="text-right pb-2 font-medium">Contracts</th>
                <th className="text-right pb-2 font-medium">Avg Cost</th>
                <th className="text-right pb-2 font-medium">Current</th>
                <th className="text-right pb-2 font-medium">Unrealized P&L</th>
              </tr>
            </thead>
            <tbody>
              {openPositions.map((pos) => (
                <tr key={pos.id} className="border-b border-gray-800/50 hover:bg-gray-800/20 transition-colors">
                  <td className="py-3">
                    <div className="text-gray-200 font-medium">{pos.matchup}</div>
                    <div className="text-xs text-gray-500 font-mono">{pos.ticker.slice(-16)}</div>
                  </td>
                  <td className="py-3 text-center">
                    <span className={`text-xs px-2 py-0.5 rounded font-bold ${
                      pos.side === 'YES' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {pos.side}
                    </span>
                  </td>
                  <td className="py-3 text-right font-mono text-gray-300">{pos.contracts}</td>
                  <td className="py-3 text-right font-mono text-gray-300">{pos.avgCost.toFixed(2)}¢</td>
                  <td className="py-3 text-right font-mono text-gray-200">{pos.currentPrice.toFixed(2)}¢</td>
                  <td className="py-3 text-right">
                    <PnL cost={pos.avgCost} current={pos.currentPrice} contracts={pos.contracts} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Closed Positions */}
      <div className="bg-[#111827] border border-gray-800 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-300">Closed Positions</h2>
          <span className={`text-sm font-mono font-bold ${closedPnL >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            Realized: {closedPnL >= 0 ? '+' : ''}${closedPnL.toFixed(2)}
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-500 border-b border-gray-800">
                <th className="text-left pb-2 font-medium">Market</th>
                <th className="text-center pb-2 font-medium">Side</th>
                <th className="text-right pb-2 font-medium">Contracts</th>
                <th className="text-right pb-2 font-medium">Avg Cost</th>
                <th className="text-right pb-2 font-medium">Exit</th>
                <th className="text-right pb-2 font-medium">Realized P&L</th>
                <th className="text-center pb-2 font-medium">Result</th>
              </tr>
            </thead>
            <tbody>
              {closedPositions.map((pos) => {
                const exit = pos.result === 'WIN' ? 1.0 : 0.0
                const pnl = (exit - pos.avgCost) * pos.contracts
                return (
                  <tr key={pos.id} className="border-b border-gray-800/50 hover:bg-gray-800/20 transition-colors">
                    <td className="py-3">
                      <div className="text-gray-200 font-medium">{pos.matchup}</div>
                      <div className="text-xs text-gray-500 font-mono">{pos.ticker.slice(-16)}</div>
                    </td>
                    <td className="py-3 text-center">
                      <span className={`text-xs px-2 py-0.5 rounded font-bold ${
                        pos.side === 'YES' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                      }`}>
                        {pos.side}
                      </span>
                    </td>
                    <td className="py-3 text-right font-mono text-gray-300">{pos.contracts}</td>
                    <td className="py-3 text-right font-mono text-gray-300">{pos.avgCost.toFixed(2)}¢</td>
                    <td className="py-3 text-right font-mono text-gray-300">{exit.toFixed(2)}¢</td>
                    <td className={`py-3 text-right font-mono font-bold ${pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {pnl >= 0 ? '+' : ''}${pnl.toFixed(2)}
                    </td>
                    <td className="py-3 text-center">
                      <span className={`text-xs px-2 py-0.5 rounded font-bold ${
                        pos.result === 'WIN'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {pos.result}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
