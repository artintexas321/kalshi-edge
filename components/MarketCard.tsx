import { Market } from '@/data/markets'

function EdgeBadge({ level, score }: { level: string; score: number }) {
  if (level === 'HIGH') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
        ▲ EDGE {score}
      </span>
    )
  }
  if (level === 'MEDIUM') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-yellow-500/15 text-yellow-400 border border-yellow-500/30">
        ~ EDGE {score}
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs text-gray-500 border border-gray-700">
      — {score}
    </span>
  )
}

function SportBadge({ sport }: { sport: string }) {
  return (
    <span className={`text-xs px-1.5 py-0.5 rounded font-mono font-bold ${
      sport === 'NBA' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'
    }`}>
      {sport}
    </span>
  )
}

export default function MarketCard({ market }: { market: Market }) {
  const impliedPct = (market.impliedProbability * 100).toFixed(1)
  const volumeK = (market.volume / 1000).toFixed(1)
  const closeDate = new Date(market.closeTime)
  const closeStr = closeDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })

  return (
    <div className={`relative bg-[#111827] border rounded-lg p-4 hover:border-gray-600 transition-all ${
      market.edgeLevel === 'HIGH' ? 'border-emerald-500/40' : 'border-gray-800'
    }`}>
      {market.edgeLevel === 'HIGH' && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-500/0 via-emerald-500/60 to-emerald-500/0 rounded-t-lg" />
      )}

      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <SportBadge sport={market.sport} />
          <span className="text-xs text-gray-500 font-mono">{market.ticker.slice(-12)}</span>
        </div>
        <EdgeBadge level={market.edgeLevel} score={market.edgeScore} />
      </div>

      <div className="mb-3">
        <div className="text-sm font-semibold text-gray-100">{market.homeTeam}</div>
        <div className="text-xs text-gray-500">vs {market.awayTeam}</div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="bg-[#0d1424] rounded p-2 text-center">
          <div className="text-xs text-gray-500 mb-1">YES</div>
          <div className={`text-lg font-bold font-mono ${
            market.yesPrice < 0.65 ? 'text-emerald-400' : 'text-gray-200'
          }`}>
            {market.yesPrice.toFixed(2)}¢
          </div>
        </div>
        <div className="bg-[#0d1424] rounded p-2 text-center">
          <div className="text-xs text-gray-500 mb-1">NO</div>
          <div className="text-lg font-bold font-mono text-gray-200">
            {market.noPrice.toFixed(2)}¢
          </div>
        </div>
        <div className="bg-[#0d1424] rounded p-2 text-center">
          <div className="text-xs text-gray-500 mb-1">PROB</div>
          <div className={`text-lg font-bold font-mono ${
            market.edgeLevel !== 'NONE' ? 'text-emerald-400' : 'text-gray-200'
          }`}>
            {impliedPct}%
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>Vol: <span className="text-gray-400">${volumeK}K</span></span>
        <span>Closes: <span className="text-gray-400">{closeStr}</span></span>
        <span className="text-gray-600">{market.lastUpdated}</span>
      </div>
    </div>
  )
}
