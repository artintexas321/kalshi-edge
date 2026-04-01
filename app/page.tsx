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

function Portfolio() {
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

function InjuryFeed() {
  const statusColor = (s: string) =>
    s === 'OUT' ? 'bg-red-900 text-red-300' :
    s === 'QUESTIONABLE' ? 'bg-yellow-900 text-yellow-300' :
    'bg-green-900 text-green-300'

  const lineColor = (s: string) =>
    s === 'expected' ? 'text-orange-400' :
    s === 'already_moved' ? 'text-gray-400' :
    'text-gray-500'

  const lineText = (s: string) =>
    s === 'expected' ? '⚡ Line movement expected' :
    s === 'already_moved' ? '✓ Already priced in' :
    '· Minimal impact'

  return (
    <div>
      <div className="flex flex-col gap-4">
        {injuries.map((inj, i) => (
          <div key={i} className={`bg-gray-900 rounded-xl border p-5 ${inj.status === 'OUT' ? 'border-red-700' : inj.status === 'QUESTIONABLE' ? 'border-yellow-700' : 'border-gray-700'}`}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded ${statusColor(inj.status)}`}>{inj.status}</span>
                  <span className="text-gray-500 text-xs">{inj.reportedAt}</span>
                </div>
                <div className="text-white font-bold text-lg">{inj.player}</div>
                <div className="text-gray-400 text-sm">{inj.team} · {inj.position} · {inj.injury}</div>
              </div>
              <div className={`text-sm font-medium ${lineColor(inj.lineMovement)} shrink-0`}>
                {lineText(inj.lineMovement)}
              </div>
            </div>
            {inj.affectedMarkets.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {inj.affectedMarkets.map(m => (
                  <span key={m} className="text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded font-mono">{m}</span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Home() {
  const [tab, setTab] = useState<'markets' | 'sizing' | 'portfolio' | 'injuries'>('markets')
  const [apiKey, setApiKey] = useState<string>('')
  const [showSettings, setShowSettings] = useState(false)
  const [liveMarkets, setLiveMarkets] = useState<typeof mockMarkets | null>(null)
  const [isLive, setIsLive] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setApiKey(localStorage.getItem('kalshi_api_key') || '')
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

  function saveApiKey(key: string) {
    setApiKey(key)
    localStorage.setItem('kalshi_api_key', key)
    setShowSettings(false)
  }

  const displayMarkets = liveMarkets ?? mockMarkets

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
            <div className="text-green-400 font-bold">$702.00</div>
            <div className="text-gray-500">+40.4% all time</div>
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
        <NavTab label="📊 Markets" active={tab === 'markets'} onClick={() => setTab('markets')} />
        <NavTab label="🎯 Bet Sizing" active={tab === 'sizing'} onClick={() => setTab('sizing')} />
        <NavTab label="💼 Portfolio" active={tab === 'portfolio'} onClick={() => setTab('portfolio')} />
        <NavTab label="🏥 Injuries" active={tab === 'injuries'} onClick={() => setTab('injuries')} />
      </div>

      {tab === 'markets' && <MarketScanner markets={displayMarkets} />}
      {tab === 'sizing' && <BetSizer />}
      {tab === 'portfolio' && <Portfolio />}
      {tab === 'injuries' && <InjuryFeed />}
    </main>
  )
}
