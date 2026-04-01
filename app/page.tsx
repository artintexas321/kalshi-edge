'use client'
import { useState, useEffect } from 'react'
import { markets as mockMarkets, positions, injuries, portfolioHistory } from '@/data/markets'

function NavTab({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-5 py-2.5 text-sm font-semibold rounded-lg transition-colors ${
        active ? 'bg-green-500 text-black' : 'text-gray-400 hover:text-white hover:bg-gray-800'
      }`}
    >
      {label}
    </button>
  )
}

function MarketScanner({ markets }: { markets: typeof mockMarkets }) {
  const [sport, setSport] = useState<'ALL' | 'NBA' | 'NHL'>('ALL')
  const [edgeOnly, setEdgeOnly] = useState(false)

  const filtered = markets
    .filter(m => sport === 'ALL' || m.sport === sport)
    .filter(m => !edgeOnly || m.edge)

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex gap-2">
          {(['ALL', 'NBA', 'NHL'] as const).map(s => (
            <button
              key={s}
              onClick={() => setSport(s)}
              className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-colors ${
                sport === s ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={edgeOnly}
            onChange={e => setEdgeOnly(e.target.checked)}
            className="accent-green-500"
          />
          <span className="text-gray-300">Edge markets only</span>
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(m => (
          <div
            key={m.ticker}
            className={`rounded-xl border p-4 transition-all ${
              m.edge ? 'border-green-500/40 bg-green-950/20' : 'border-gray-700 bg-gray-900'
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                    m.sport === 'NBA' ? 'bg-orange-900 text-orange-300' : 'bg-blue-900 text-blue-300'
                  }`}>{m.sport}</span>
                  {m.edge && (
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-green-900 text-green-300">
                      ✦ EDGE {m.edgeScore}/10
                    </span>
                  )}
                  {m.status === 'closing_soon' && (
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-red-900 text-red-300 animate-pulse">
                      CLOSING SOON
                    </span>
                  )}
                </div>
                <div className="text-white font-semibold">{m.matchup}</div>
                <div className="text-gray-400 text-xs mt-0.5">{m.gameTime} · Vol: ${(m.volume/1000).toFixed(0)}k</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-3">
              <div className="bg-gray-800 rounded-lg p-3 text-center">
                <div className="text-xs text-gray-400 mb-1">YES</div>
                <div className="text-xl font-bold text-green-400">{Math.round(m.yesPrice * 100)}¢</div>
                <div className="text-xs text-gray-500">{Math.round(m.yesPrice * 100)}% imp.</div>
              </div>
              <div className="bg-gray-800 rounded-lg p-3 text-center">
                <div className="text-xs text-gray-400 mb-1">NO</div>
                <div className="text-xl font-bold text-red-400">{Math.round(m.noPrice * 100)}¢</div>
                <div className="text-xs text-gray-500">{Math.round(m.noPrice * 100)}% imp.</div>
              </div>
              <div className="bg-gray-800 rounded-lg p-3 text-center">
                <div className="text-xs text-gray-400 mb-1">Spread</div>
                <div className="text-xl font-bold text-yellow-400">{Math.round((1 - m.yesPrice - m.noPrice) * 100)}¢</div>
                <div className="text-xs text-gray-500">vig</div>
              </div>
            </div>

            <div className="text-xs text-gray-500">
              Closes: {m.closeTime} · {m.ticker}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function BetSizer() {
  const [bankroll, setBankroll] = useState(700)
  const [price, setPrice] = useState(0.62)

  const maxBet = bankroll * 0.01
  const floor = bankroll * 0.05
  const kellyFraction = ((1 / price) - 1) * price - (1 - price)
  const kellyBet = Math.max(0, kellyFraction * bankroll * 0.25) // quarter kelly for safety

  const rows = [5, 10, 15, 20, 25, 30, 50]

  return (
    <div className="max-w-2xl">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div className="bg-gray-900 rounded-xl border border-gray-700 p-5">
          <label className="block text-sm text-gray-400 mb-2">Bankroll ($)</label>
          <input
            type="number"
            value={bankroll}
            onChange={e => setBankroll(Number(e.target.value))}
            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white text-xl font-bold focus:outline-none focus:border-green-500"
          />
        </div>
        <div className="bg-gray-900 rounded-xl border border-gray-700 p-5">
          <label className="block text-sm text-gray-400 mb-2">Contract Price (¢)</label>
          <input
            type="number"
            min="1"
            max="99"
            value={Math.round(price * 100)}
            onChange={e => setPrice(Number(e.target.value) / 100)}
            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white text-xl font-bold focus:outline-none focus:border-green-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-green-950 border border-green-700 rounded-xl p-4 text-center">
          <div className="text-green-400 text-sm font-medium mb-1">Max Per Bet (1%)</div>
          <div className="text-green-300 text-2xl font-bold">${maxBet.toFixed(2)}</div>
        </div>
        <div className="bg-blue-950 border border-blue-700 rounded-xl p-4 text-center">
          <div className="text-blue-400 text-sm font-medium mb-1">Kelly Criterion (¼)</div>
          <div className="text-blue-300 text-2xl font-bold">${kellyBet.toFixed(2)}</div>
        </div>
        <div className="bg-yellow-950 border border-yellow-700 rounded-xl p-4 text-center">
          <div className="text-yellow-400 text-sm font-medium mb-1">Floor (5%)</div>
          <div className="text-yellow-300 text-2xl font-bold">${floor.toFixed(2)}</div>
        </div>
      </div>

      <div className="bg-gray-900 rounded-xl border border-gray-700 overflow-hidden">
        <div className="px-5 py-3 bg-gray-800 border-b border-gray-700">
          <h3 className="font-semibold text-gray-200">Risk/Reward Table @ {Math.round(price * 100)}¢</h3>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-400 border-b border-gray-700">
              <th className="px-5 py-3 text-left">Contracts</th>
              <th className="px-5 py-3 text-right">Cost</th>
              <th className="px-5 py-3 text-right">Win (+$)</th>
              <th className="px-5 py-3 text-right">Loss (-$)</th>
              <th className="px-5 py-3 text-right">% of Roll</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(n => {
              const cost = n * price
              const win = n * (1 - price)
              const pct = (cost / bankroll) * 100
              const overMax = pct > 1
              return (
                <tr key={n} className={`border-b border-gray-800 ${overMax ? 'opacity-40' : ''}`}>
                  <td className="px-5 py-3 font-bold text-white">{n}</td>
                  <td className="px-5 py-3 text-right text-gray-300">${cost.toFixed(2)}</td>
                  <td className="px-5 py-3 text-right text-green-400">+${win.toFixed(2)}</td>
                  <td className="px-5 py-3 text-right text-red-400">-${cost.toFixed(2)}</td>
                  <td className={`px-5 py-3 text-right font-medium ${overMax ? 'text-red-400' : 'text-gray-300'}`}>
                    {pct.toFixed(1)}% {overMax && '⚠️'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function Portfolio({ livePortfolio }: { livePortfolio: LivePortfolio | null }) {
  // If live data, show it instead
  if (livePortfolio) {
    const bal = livePortfolio.balance?.balance ? (livePortfolio.balance.balance / 100).toFixed(2) : '—'
    const payout = livePortfolio.balance?.payout ? (livePortfolio.balance.payout / 100).toFixed(2) : '—'
    const livePos = livePortfolio.positions ?? []
    return (
      <div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-900 border border-green-700 rounded-xl p-4 text-center">
            <div className="text-gray-400 text-sm mb-1">Cash Balance</div>
            <div className="text-green-400 text-2xl font-bold">${bal}</div>
            <div className="text-xs text-green-600 mt-1">● live</div>
          </div>
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 text-center">
            <div className="text-gray-400 text-sm mb-1">Pending Payout</div>
            <div className="text-white text-2xl font-bold">${payout}</div>
          </div>
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 text-center">
            <div className="text-gray-400 text-sm mb-1">Open Positions</div>
            <div className="text-white text-2xl font-bold">{livePos.filter(p => p.position !== 0).length}</div>
          </div>
        </div>
        {livePos.filter(p => p.position !== 0).length > 0 ? (
          <div className="bg-gray-900 rounded-xl border border-gray-700 overflow-hidden">
            <div className="px-5 py-3 bg-gray-800 border-b border-gray-700 font-semibold text-gray-200">Live Positions</div>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-400 border-b border-gray-700">
                  <th className="px-4 py-3 text-left">Ticker</th>
                  <th className="px-4 py-3 text-right">Contracts</th>
                  <th className="px-4 py-3 text-right">Cost</th>
                  <th className="px-4 py-3 text-right">Unrealized P&L</th>
                  <th className="px-4 py-3 text-right">Realized P&L</th>
                </tr>
              </thead>
              <tbody>
                {livePos.filter(p => p.position !== 0).map((p, i) => (
                  <tr key={i} className="border-b border-gray-800">
                    <td className="px-4 py-3 font-mono text-xs text-white">{p.ticker}</td>
                    <td className="px-4 py-3 text-right text-white font-bold">{p.position}</td>
                    <td className="px-4 py-3 text-right text-gray-300">${(p.total_cost / 100).toFixed(2)}</td>
                    <td className={`px-4 py-3 text-right font-bold ${p.unrealized_pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {p.unrealized_pnl >= 0 ? '+' : ''}${(p.unrealized_pnl / 100).toFixed(2)}
                    </td>
                    <td className={`px-4 py-3 text-right font-bold ${p.realized_pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {p.realized_pnl >= 0 ? '+' : ''}${(p.realized_pnl / 100).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-10 text-gray-500">No open positions</div>
        )}
      </div>
    )
  }

  const open = positions.filter(p => p.status === 'open')
  const closed = positions.filter(p => p.status === 'closed')
  const unrealizedPnL = open.reduce((sum, p) => sum + p.contracts * (p.currentPrice - p.avgCost), 0)
  const realizedPnL = closed.reduce((sum, p) => {
    if (p.result === 'win') return sum + p.contracts * (1 - p.avgCost)
    return sum + p.contracts * (-p.avgCost)
  }, 0)
  const totalValue = 702
  const startValue = 500
  const totalReturn = ((totalValue - startValue) / startValue) * 100

  const maxVal = Math.max(...portfolioHistory.map(h => h.value))
  const minVal = Math.min(...portfolioHistory.map(h => h.value))

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 text-center">
          <div className="text-gray-400 text-sm mb-1">Portfolio Value</div>
          <div className="text-white text-2xl font-bold">${totalValue}</div>
        </div>
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 text-center">
          <div className="text-gray-400 text-sm mb-1">Total Return</div>
          <div className="text-green-400 text-2xl font-bold">+{totalReturn.toFixed(1)}%</div>
        </div>
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 text-center">
          <div className="text-gray-400 text-sm mb-1">Unrealized P&L</div>
          <div className={`text-2xl font-bold ${unrealizedPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {unrealizedPnL >= 0 ? '+' : ''}${unrealizedPnL.toFixed(2)}
          </div>
        </div>
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 text-center">
          <div className="text-gray-400 text-sm mb-1">Realized P&L</div>
          <div className={`text-2xl font-bold ${realizedPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {realizedPnL >= 0 ? '+' : ''}${realizedPnL.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Simple SVG sparkline */}
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-5 mb-6">
        <h3 className="font-semibold text-gray-200 mb-4">Portfolio Value — March 2026</h3>
        <svg viewBox="0 0 800 120" className="w-full h-24">
          <polyline
            fill="none"
            stroke="#22c55e"
            strokeWidth="2.5"
            points={portfolioHistory.map((h, i) => {
              const x = (i / (portfolioHistory.length - 1)) * 780 + 10
              const y = 110 - ((h.value - minVal) / (maxVal - minVal)) * 90
              return `${x},${y}`
            }).join(' ')}
          />
          {portfolioHistory.map((h, i) => {
            const x = (i / (portfolioHistory.length - 1)) * 780 + 10
            const y = 110 - ((h.value - minVal) / (maxVal - minVal)) * 90
            return <circle key={i} cx={x} cy={y} r="3" fill="#22c55e" />
          })}
        </svg>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          {portfolioHistory.filter((_, i) => i % 2 === 0).map(h => (
            <span key={h.date}>{h.date}</span>
          ))}
        </div>
      </div>

      <h3 className="font-semibold text-gray-200 mb-3">Open Positions</h3>
      <div className="bg-gray-900 rounded-xl border border-gray-700 overflow-hidden mb-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-400 border-b border-gray-700 bg-gray-800">
              <th className="px-4 py-3 text-left">Market</th>
              <th className="px-4 py-3 text-right">Contracts</th>
              <th className="px-4 py-3 text-right">Avg Cost</th>
              <th className="px-4 py-3 text-right">Current</th>
              <th className="px-4 py-3 text-right">P&L</th>
            </tr>
          </thead>
          <tbody>
            {open.map(p => {
              const pnl = p.contracts * (p.currentPrice - p.avgCost)
              return (
                <tr key={p.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                  <td className="px-4 py-3">
                    <div className="text-white font-medium text-xs leading-snug">{p.matchup}</div>
                    <div className="text-gray-500 text-xs">{p.side} · {p.openedAt}</div>
                  </td>
                  <td className="px-4 py-3 text-right text-white font-bold">{p.contracts}</td>
                  <td className="px-4 py-3 text-right text-gray-300">{Math.round(p.avgCost * 100)}¢</td>
                  <td className="px-4 py-3 text-right text-gray-300">{Math.round(p.currentPrice * 100)}¢</td>
                  <td className={`px-4 py-3 text-right font-bold ${pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {pnl >= 0 ? '+' : ''}${pnl.toFixed(2)}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <h3 className="font-semibold text-gray-200 mb-3">Closed Positions</h3>
      <div className="bg-gray-900 rounded-xl border border-gray-700 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-400 border-b border-gray-700 bg-gray-800">
              <th className="px-4 py-3 text-left">Market</th>
              <th className="px-4 py-3 text-right">Contracts</th>
              <th className="px-4 py-3 text-right">Result</th>
              <th className="px-4 py-3 text-right">P&L</th>
            </tr>
          </thead>
          <tbody>
            {closed.map(p => {
              const pnl = p.result === 'win'
                ? p.contracts * (1 - p.avgCost)
                : p.contracts * (-p.avgCost)
              return (
                <tr key={p.id} className="border-b border-gray-800">
                  <td className="px-4 py-3">
                    <div className="text-white font-medium text-xs">{p.matchup}</div>
                    <div className="text-gray-500 text-xs">{p.side} · {p.closedAt}</div>
                  </td>
                  <td className="px-4 py-3 text-right text-white font-bold">{p.contracts}</td>
                  <td className="px-4 py-3 text-right">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${p.result === 'win' ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
                      {p.result?.toUpperCase()}
                    </span>
                  </td>
                  <td className={`px-4 py-3 text-right font-bold ${pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {pnl >= 0 ? '+' : ''}${pnl.toFixed(2)}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

interface LiveInjury {
  player: string; team: string; position: string; injury: string;
  status: string; reportedAt: string; sport: string; lineMovement: string; affectedMarkets: string[]
}

function InjuryFeed() {
  const [liveInjuries, setLiveInjuries] = useState<LiveInjury[] | null>(null)
  const [injLive, setInjLive] = useState(false)
  const [sport, setSport] = useState<'ALL' | 'NBA' | 'NHL'>('ALL')
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'OUT' | 'QUESTIONABLE'>('ALL')

  useEffect(() => {
    fetch('/api/injuries')
      .then(r => r.json())
      .then(d => {
        if (d.live && d.injuries?.length > 0) {
          setLiveInjuries(d.injuries)
          setInjLive(true)
        }
      })
      .catch(() => {})
  }, [])

  const displayInjuries = liveInjuries ?? injuries as unknown as LiveInjury[]
  const filtered = displayInjuries
    .filter(i => sport === 'ALL' || i.sport === sport)
    .filter(i => statusFilter === 'ALL' || i.status === statusFilter)

  const statusColor = (s: string) =>
    s === 'OUT' ? 'bg-red-900 text-red-300' :
    s === 'QUESTIONABLE' ? 'bg-yellow-900 text-yellow-300' :
    'bg-green-900 text-green-300'

  const lineColor = (s: string) =>
    s === 'expected' ? 'text-orange-400' :
    s === 'already_moved' ? 'text-gray-400' : 'text-gray-500'

  const lineText = (s: string) =>
    s === 'expected' ? '⚡ Line movement expected' :
    s === 'already_moved' ? '✓ Already priced in' : '· Minimal impact'

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-5 items-center">
        <div className="flex gap-1">
          {(['ALL', 'NBA', 'NHL'] as const).map(s => (
            <button key={s} onClick={() => setSport(s)}
              className={`px-3 py-1 text-xs font-bold rounded-full ${sport === s ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400'}`}>{s}</button>
          ))}
        </div>
        <div className="flex gap-1">
          {(['ALL', 'OUT', 'QUESTIONABLE'] as const).map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-1 text-xs font-bold rounded-full ${statusFilter === s ? 'bg-red-700 text-white' : 'bg-gray-800 text-gray-400'}`}>{s}</button>
          ))}
        </div>
        {injLive
          ? <span className="text-xs bg-green-900 text-green-300 px-2 py-0.5 rounded font-bold ml-auto">● LIVE ESPN</span>
          : <span className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded ml-auto">MOCK DATA</span>}
      </div>
      <div className="flex flex-col gap-3">
        {filtered.slice(0, 30).map((inj, i) => (
          <div key={i} className={`bg-gray-900 rounded-xl border p-4 ${inj.status === 'OUT' ? 'border-red-700/60' : inj.status === 'QUESTIONABLE' ? 'border-yellow-700/60' : 'border-gray-700'}`}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded ${statusColor(inj.status)}`}>{inj.status}</span>
                  <span className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded">{inj.sport}</span>
                  <span className="text-gray-500 text-xs">{inj.reportedAt}</span>
                </div>
                <div className="text-white font-bold">{inj.player}</div>
                <div className="text-gray-400 text-sm">{inj.team} · {inj.position} · {inj.injury}</div>
              </div>
              <div className={`text-xs font-medium ${lineColor(inj.lineMovement)} shrink-0`}>
                {lineText(inj.lineMovement)}
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <div className="text-center py-10 text-gray-500">No injuries match filter</div>}
      </div>
    </div>
  )
}

interface EdgePick {
  ticker: string; title: string; sport: string; team1: string; team2: string
  yesAsk: number; volume: number; action: string; confidence: string
  ourProb: number; marketProb: number; edgePct: number; kellyFraction: number
  hasStar?: boolean
  injuries: { player: string; team: string; delta: number; status: string; isStar?: boolean }[]
  reasoning: string
}

function ResultsTab() {
  const [data, setData] = useState<{ picks: { ticker: string; title: string; action: string; edgePct: number; cost?: number; payout?: number; status: string; result: string | null; trackedAt: string }[]; stats: { total: number; open: number; wins: number; losses: number; winRate: string; pnl: string; roi: string } } | null>(null)
  const [marking, setMarking] = useState<string | null>(null)

  function load() {
    fetch('/api/results').then(r => r.json()).then(setData).catch(() => {})
  }

  useEffect(() => { load() }, [])

  function markResult(ticker: string, result: string, cost: number) {
    const payout = result === 'win' ? cost * 1.6 : result === 'push' ? cost : 0
    fetch('/api/results', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ticker, result, payout }) })
      .then(() => { setMarking(null); load() })
  }

  if (!data) return <div className="text-center py-20 text-gray-400">Loading results...</div>

  const { picks, stats } = data

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Tracked', value: String(stats.total), color: 'text-white' },
          { label: 'Win Rate', value: `${stats.winRate}%`, color: 'text-green-400' },
          { label: 'Total P&L', value: `$${stats.pnl}`, color: parseFloat(stats.pnl) >= 0 ? 'text-green-400' : 'text-red-400' },
          { label: 'ROI', value: `${stats.roi}%`, color: parseFloat(stats.roi) >= 0 ? 'text-green-400' : 'text-red-400' },
        ].map(s => (
          <div key={s.label} className="bg-gray-900 border border-gray-700 rounded-xl p-4 text-center">
            <div className="text-gray-400 text-sm mb-1">{s.label}</div>
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
          </div>
        ))}
      </div>

      {picks.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No tracked bets yet. Hit "Track This Bet" on any Edge Pick to start.
        </div>
      ) : (
        <div className="bg-gray-900 rounded-xl border border-gray-700 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-800 border-b border-gray-700 text-gray-400">
                <th className="px-4 py-3 text-left">Market</th>
                <th className="px-4 py-3 text-right">Edge</th>
                <th className="px-4 py-3 text-right">Cost</th>
                <th className="px-4 py-3 text-right">P&L</th>
                <th className="px-4 py-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {picks.map(p => {
                const pnl = p.status === 'open' ? 0 : (p.payout ?? 0) - (p.cost ?? 0)
                return (
                  <tr key={p.ticker} className="border-b border-gray-800">
                    <td className="px-4 py-3">
                      <div className="text-white text-xs font-medium">{p.title}</div>
                      <div className="text-gray-500 text-xs">{p.action} · {new Date(p.trackedAt).toLocaleDateString()}</div>
                    </td>
                    <td className="px-4 py-3 text-right text-yellow-400 font-bold">+{p.edgePct}%</td>
                    <td className="px-4 py-3 text-right text-gray-300">${(p.cost ?? 0).toFixed(2)}</td>
                    <td className={`px-4 py-3 text-right font-bold ${pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {p.status === 'open' ? '—' : `${pnl >= 0 ? '+' : ''}$${pnl.toFixed(2)}`}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {p.status === 'open' ? (
                        marking === p.ticker ? (
                          <div className="flex gap-1 justify-end">
                            {['win', 'loss', 'push'].map(r => (
                              <button key={r} onClick={() => markResult(p.ticker, r, p.cost ?? 0)}
                                className={`text-xs px-2 py-1 rounded font-bold ${r === 'win' ? 'bg-green-700 text-white' : r === 'loss' ? 'bg-red-700 text-white' : 'bg-gray-700 text-gray-300'}`}>
                                {r}
                              </button>
                            ))}
                          </div>
                        ) : (
                          <button onClick={() => setMarking(p.ticker)}
                            className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-2 py-1 rounded">
                            Mark Result
                          </button>
                        )
                      ) : (
                        <span className={`text-xs font-bold px-2 py-0.5 rounded ${p.result === 'win' ? 'bg-green-900 text-green-300' : p.result === 'loss' ? 'bg-red-900 text-red-300' : 'bg-gray-800 text-gray-400'}`}>
                          {p.result?.toUpperCase()}
                        </span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function EdgePicks({ bankroll }: { bankroll: number }) {
  const [picks, setPicks] = useState<EdgePick[]>([])
  const [loading, setLoading] = useState(true)
  const [live, setLive] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<string>('')
  const [tracked, setTracked] = useState<Set<string>>(new Set())
  const [showAlertModal, setShowAlertModal] = useState(false)
  const [alertContact, setAlertContact] = useState('')
  const [alertSent, setAlertSent] = useState(false)

  function load() {
    setLoading(true)
    fetch('/api/edge')
      .then(r => r.json())
      .then(d => {
        setPicks(d.picks ?? [])
        setLive(d.live ?? false)
        setLastUpdated(new Date().toLocaleTimeString())
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
    if (typeof window !== 'undefined') {
      const stored = JSON.parse(localStorage.getItem('tracked_picks') || '[]')
      setTracked(new Set(stored))
    }
  }, [])

  function trackPick(pick: EdgePick, betSize: number, contracts: number) {
    const payload = { ticker: pick.ticker, title: pick.title, action: pick.action, ourProb: pick.ourProb, marketProb: pick.marketProb, edgePct: pick.edgePct, contracts, cost: betSize }
    fetch('/api/track', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      .then(() => {
        const next = new Set(tracked).add(pick.ticker)
        setTracked(next)
        localStorage.setItem('tracked_picks', JSON.stringify([...next]))
      })
  }

  function signupAlert() {
    if (!alertContact.trim()) return
    fetch('/api/alert-check', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contact: alertContact }) })
      .then(() => { setAlertSent(true); setTimeout(() => setShowAlertModal(false), 2000) })
  }

  const bets = picks.filter(p => p.action !== 'PASS')
  const passes = picks.filter(p => p.action === 'PASS')

  const actionStyle = (action: string, conf: string) => {
    if (action === 'PASS') return { border: 'border-gray-700', bg: 'bg-gray-900', badge: 'bg-gray-800 text-gray-400' }
    if (conf === 'HIGH') return { border: 'border-green-500', bg: 'bg-green-950/30', badge: 'bg-green-700 text-white' }
    if (conf === 'MEDIUM') return { border: 'border-yellow-600', bg: 'bg-yellow-950/20', badge: 'bg-yellow-700 text-white' }
    return { border: 'border-blue-700', bg: 'bg-blue-950/20', badge: 'bg-blue-800 text-white' }
  }

  if (loading) return (
    <div className="text-center py-20 text-gray-400">
      <div className="text-3xl mb-3 animate-pulse">⚡</div>
      <div>Scanning markets + injury reports...</div>
    </div>
  )

  return (
    <div>
      {showAlertModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-sm w-full">
            <h3 className="font-bold text-white mb-2">🔔 Alert Me</h3>
            <p className="text-gray-400 text-sm mb-4">Enter your phone or email. We'll notify you when HIGH confidence edges appear before tip-off.</p>
            {alertSent ? (
              <div className="text-green-400 text-center font-bold py-3">✓ You're on the list! SMS alerts coming soon.</div>
            ) : (
              <>
                <input value={alertContact} onChange={e => setAlertContact(e.target.value)}
                  placeholder="phone or email"
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white text-sm mb-3 focus:outline-none focus:border-green-500" />
                <div className="flex gap-2">
                  <button onClick={signupAlert} className="flex-1 bg-green-600 hover:bg-green-500 text-white font-bold py-2 rounded-lg text-sm">Sign Up</button>
                  <button onClick={() => setShowAlertModal(false)} className="px-4 py-2 bg-gray-800 text-gray-400 rounded-lg text-sm">Cancel</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="font-bold text-white text-lg">Today's Edge Picks</h2>
          <p className="text-gray-500 text-xs mt-0.5">
            Star player-weighted · injury-adjusted · ¼ Kelly sized · {lastUpdated && `Updated ${lastUpdated}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {live
            ? <span className="text-xs bg-green-900 text-green-300 px-2 py-0.5 rounded font-bold">● LIVE</span>
            : <span className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded">OFFLINE</span>}
          <button onClick={() => setShowAlertModal(true)} className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded-lg">🔔 Alerts</button>
          <button onClick={load} className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded-lg">↻ Refresh</button>
        </div>
      </div>

      {bets.length === 0 && (
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 text-center text-gray-400 mb-6">
          No edges found right now — markets are fairly priced or no games are open. Check back closer to game time.
        </div>
      )}

      {bets.length > 0 && (
        <>
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
            {bets.length} Edge{bets.length !== 1 ? 's' : ''} Found
          </div>
          <div className="flex flex-col gap-4 mb-8">
            {bets.map(pick => {
              const style = actionStyle(pick.action, pick.confidence)
              const betSize = Math.min(bankroll * pick.kellyFraction, bankroll * 0.01)
              const contracts = Math.floor(betSize / pick.yesAsk)
              return (
                <div key={pick.ticker} className={`rounded-xl border p-5 ${style.border} ${style.bg}`}>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className={`text-sm font-bold px-3 py-1 rounded-lg ${style.badge}`}>
                          {pick.action}
                        </span>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                          pick.confidence === 'HIGH' ? 'bg-green-900 text-green-300' :
                          pick.confidence === 'MEDIUM' ? 'bg-yellow-900 text-yellow-300' :
                          'bg-gray-800 text-gray-400'
                        }`}>{pick.confidence} CONFIDENCE</span>
                        <span className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded">{pick.sport}</span>
                      </div>
                      <div className="text-white font-bold text-base">{pick.title}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-green-400 font-bold text-lg">+{pick.edgePct}%</div>
                      <div className="text-gray-500 text-xs">edge</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mb-3 text-center">
                    <div className="bg-black/30 rounded-lg p-2">
                      <div className="text-xs text-gray-400">Market Price</div>
                      <div className="text-white font-bold">{pick.marketProb}¢</div>
                    </div>
                    <div className="bg-black/30 rounded-lg p-2">
                      <div className="text-xs text-gray-400">Our Estimate</div>
                      <div className="text-green-400 font-bold">{pick.ourProb}¢</div>
                    </div>
                    <div className="bg-black/30 rounded-lg p-2">
                      <div className="text-xs text-gray-400">Suggested Size</div>
                      <div className="text-white font-bold">${betSize.toFixed(2)}</div>
                      <div className="text-xs text-gray-500">{contracts} contracts</div>
                    </div>
                  </div>

                  <div className="text-xs text-gray-400 bg-black/20 rounded-lg px-3 py-2 mb-3">
                    💡 {pick.reasoning}
                    {pick.hasStar && <span className="ml-2 text-yellow-400 font-bold">⭐ Star player impact</span>}
                  </div>
                  <button
                    onClick={() => trackPick(pick, betSize, contracts)}
                    disabled={tracked.has(pick.ticker)}
                    className={`w-full text-sm font-bold py-2 rounded-lg transition-colors ${
                      tracked.has(pick.ticker)
                        ? 'bg-gray-800 text-gray-500 cursor-default'
                        : 'bg-green-700 hover:bg-green-600 text-white'
                    }`}
                  >
                    {tracked.has(pick.ticker) ? '✓ Tracked' : 'Track This Bet'}
                  </button>
                </div>
              )
            })}
          </div>
        </>
      )}

      {passes.length > 0 && (
        <>
          <div className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-3">
            {passes.length} Pass{passes.length !== 1 ? 'es' : ''} — No Edge
          </div>
          <div className="flex flex-col gap-2">
            {passes.slice(0, 8).map(pick => (
              <div key={pick.ticker} className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 flex items-center justify-between">
                <div>
                  <div className="text-gray-400 text-sm">{pick.title}</div>
                  <div className="text-gray-600 text-xs">{pick.sport} · Market: {pick.marketProb}¢ · Our est: {pick.ourProb}¢</div>
                </div>
                <span className="text-xs bg-gray-800 text-gray-500 px-2 py-0.5 rounded font-bold">PASS</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

interface LivePortfolio {
  positions: { ticker: string; position: number; market_exposure: number; realized_pnl: number; unrealized_pnl: number; total_cost: number }[]
  balance: { balance: number; payout: number }
}

export default function Home() {
  const [tab, setTab] = useState<'edge' | 'markets' | 'sizing' | 'portfolio' | 'injuries' | 'results'>('edge')
  const [apiKey, setApiKey] = useState<string>('')
  const [showSettings, setShowSettings] = useState(false)
  const [liveMarkets, setLiveMarkets] = useState<typeof mockMarkets | null>(null)
  const [isLive, setIsLive] = useState(false)
  const [livePortfolio, setLivePortfolio] = useState<LivePortfolio | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const key = localStorage.getItem('kalshi_api_key') || ''
      setApiKey(key)
      if (key) fetchPortfolio(key)
    }
  }, [])

  useEffect(() => {
    fetch('/api/markets')
      .then(r => r.json())
      .then(d => {
        if (d.live && d.markets?.length > 0) {
          setLiveMarkets(d.markets)
          setIsLive(true)
        }
      })
      .catch(() => {})
  }, [])

  function fetchPortfolio(key: string) {
    fetch('/api/portfolio', { headers: { 'x-kalshi-key': key } })
      .then(r => r.json())
      .then(d => { if (d.live) setLivePortfolio(d) })
      .catch(() => {})
  }

  function saveApiKey(key: string) {
    setApiKey(key)
    localStorage.setItem('kalshi_api_key', key)
    setShowSettings(false)
    if (key) fetchPortfolio(key)
  }

  const displayMarkets = liveMarkets ?? mockMarkets
  const portfolioBalance = livePortfolio?.balance?.balance
    ? (livePortfolio.balance.balance / 100).toFixed(2)
    : '702.00'

  return (
    <main className="max-w-6xl mx-auto p-4 pb-16">
      <div className="flex items-center justify-between mb-6 pt-2">
        <div>
          <h1 className="text-2xl font-bold text-white">Kalshi Edge</h1>
          <p className="text-gray-500 text-sm flex items-center gap-2">
            Prediction markets dashboard
            {isLive
              ? <span className="text-xs bg-green-900 text-green-300 px-2 py-0.5 rounded font-bold animate-pulse">● LIVE</span>
              : <span className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded">MOCK DATA</span>
            }
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right text-sm">
            <div className="text-green-400 font-bold">${portfolioBalance}</div>
            <div className="text-gray-500">{livePortfolio ? '● live balance' : '+40.4% all time'}</div>
          </div>
          <button onClick={() => setShowSettings(!showSettings)} className="text-gray-400 hover:text-white text-xl" title="Settings">⚙️</button>
        </div>
      </div>

      {showSettings && (
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-5 mb-6">
          <h3 className="font-semibold text-white mb-3">Kalshi API Key</h3>
          <p className="text-gray-400 text-sm mb-3">Enter your Kalshi API key to see live market data and your real portfolio. Stored locally in your browser.</p>
          <div className="flex gap-2">
            <input
              type="password"
              defaultValue={apiKey}
              id="api-key-input"
              placeholder="your-kalshi-api-key"
              className="flex-1 bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white text-sm font-mono focus:outline-none focus:border-green-500"
            />
            <button
              onClick={() => {
                const val = (document.getElementById('api-key-input') as HTMLInputElement).value
                saveApiKey(val)
              }}
              className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white text-sm font-semibold rounded-lg"
            >
              Save
            </button>
          </div>
          {apiKey && <div className="text-xs text-green-400 mt-2">✓ API key saved</div>}
        </div>
      )}

      <div className="flex gap-1 bg-gray-900 p-1 rounded-xl mb-6 overflow-x-auto">
        <NavTab label="⚡ Edge Picks" active={tab === 'edge'} onClick={() => setTab('edge')} />
        <NavTab label="📊 Markets" active={tab === 'markets'} onClick={() => setTab('markets')} />
        <NavTab label="🎯 Bet Sizing" active={tab === 'sizing'} onClick={() => setTab('sizing')} />
        <NavTab label="💼 Portfolio" active={tab === 'portfolio'} onClick={() => setTab('portfolio')} />
        <NavTab label="🏥 Injuries" active={tab === 'injuries'} onClick={() => setTab('injuries')} />
        <NavTab label="📈 Results" active={tab === 'results'} onClick={() => setTab('results')} />
      </div>

      {tab === 'edge' && <EdgePicks bankroll={parseFloat(portfolioBalance)} />}
      {tab === 'markets' && <MarketScanner markets={displayMarkets} />}
      {tab === 'sizing' && <BetSizer />}
      {tab === 'portfolio' && <Portfolio livePortfolio={livePortfolio} />}
      {tab === 'injuries' && <InjuryFeed />}
      {tab === 'results' && <ResultsTab />}
    </main>
  )
}
