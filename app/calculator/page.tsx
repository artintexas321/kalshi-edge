'use client'

import { useState, useMemo } from 'react'

function calcKelly(bankroll: number, prob: number, odds: number) {
  // Kelly: f* = (bp - q) / b   where b = decimal odds-1, p = win prob, q = 1-p
  const b = odds - 1
  const q = 1 - prob
  const f = (b * prob - q) / b
  return Math.max(0, f) * bankroll
}

export default function Calculator() {
  const [bankroll, setBankroll] = useState(1000)
  const [winProb, setWinProb] = useState(0.62)
  const [contractPrice, setContractPrice] = useState(0.62)
  const [contractCount, setContractCount] = useState(10)

  const maxBet = bankroll * 0.01
  const floorProtection = bankroll * 0.90

  const decimalOdds = 1 / contractPrice
  const kellySuggestion = calcKelly(bankroll, winProb, decimalOdds)
  const halfKelly = kellySuggestion / 2

  const expectedValue = (winProb * (1 - contractPrice) - (1 - winProb) * contractPrice).toFixed(4)
  const evPositive = parseFloat(expectedValue) > 0

  const riskRewardRows = useMemo(() => {
    return [5, 10, 15, 20, 25, 30, 40, 50].map((count) => {
      const cost = count * contractPrice
      const maxProfit = count * (1 - contractPrice)
      const maxLoss = cost
      const roi = ((maxProfit / cost) * 100).toFixed(1)
      const pctBankroll = ((cost / bankroll) * 100).toFixed(1)
      return { count, cost, maxProfit, maxLoss, roi, pctBankroll }
    })
  }, [bankroll, contractPrice])

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-100">Bet Sizing Calculator</h1>
        <p className="text-sm text-gray-500 mt-0.5">Kelly Criterion + 1% rule + floor protection</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Inputs */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-[#111827] border border-gray-800 rounded-lg p-4">
            <h2 className="text-sm font-semibold text-gray-300 mb-4">Parameters</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Bankroll ($)</label>
                <input
                  type="number"
                  value={bankroll}
                  onChange={(e) => setBankroll(Number(e.target.value))}
                  className="w-full bg-[#0d1424] border border-gray-700 rounded px-3 py-2 text-gray-100 font-mono focus:outline-none focus:border-emerald-500/50"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Your Win Probability</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="1"
                  value={winProb}
                  onChange={(e) => setWinProb(Number(e.target.value))}
                  className="w-full bg-[#0d1424] border border-gray-700 rounded px-3 py-2 text-gray-100 font-mono focus:outline-none focus:border-emerald-500/50"
                />
                <div className="text-xs text-gray-600 mt-1">{(winProb * 100).toFixed(0)}% win probability</div>
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Contract Price (YES ¢)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max="0.99"
                  value={contractPrice}
                  onChange={(e) => setContractPrice(Number(e.target.value))}
                  className="w-full bg-[#0d1424] border border-gray-700 rounded px-3 py-2 text-gray-100 font-mono focus:outline-none focus:border-emerald-500/50"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Contracts to Size</label>
                <input
                  type="number"
                  value={contractCount}
                  onChange={(e) => setContractCount(Number(e.target.value))}
                  className="w-full bg-[#0d1424] border border-gray-700 rounded px-3 py-2 text-gray-100 font-mono focus:outline-none focus:border-emerald-500/50"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="lg:col-span-2 space-y-4">
          {/* Key outputs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: '1% Max Bet', value: `$${maxBet.toFixed(2)}`, color: 'text-gray-100', bg: '' },
              { label: 'Full Kelly', value: `$${kellySuggestion.toFixed(2)}`, color: 'text-emerald-400', bg: evPositive ? 'border-emerald-500/30' : '' },
              { label: '½ Kelly (safer)', value: `$${halfKelly.toFixed(2)}`, color: 'text-yellow-400', bg: '' },
              { label: 'Exp. Value / $1', value: `${evPositive ? '+' : ''}${expectedValue}`, color: evPositive ? 'text-emerald-400' : 'text-red-400', bg: '' },
            ].map((item) => (
              <div key={item.label} className={`bg-[#111827] border ${item.bg || 'border-gray-800'} rounded-lg p-3`}>
                <div className="text-xs text-gray-500 mb-1">{item.label}</div>
                <div className={`text-xl font-bold font-mono ${item.color}`}>{item.value}</div>
              </div>
            ))}
          </div>

          {/* Floor Protection */}
          <div className="bg-[#111827] border border-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-gray-300">Floor Protection</h2>
              <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                Keep 90% in cash
              </span>
            </div>
            <div className="flex items-center gap-4">
              <div>
                <div className="text-2xl font-bold font-mono text-gray-100">${floorProtection.toFixed(2)}</div>
                <div className="text-xs text-gray-500">minimum cash reserve</div>
              </div>
              <div className="flex-1 bg-gray-800 rounded-full h-2">
                <div
                  className="bg-emerald-500 h-2 rounded-full transition-all"
                  style={{ width: `${Math.min(100, (floorProtection / bankroll) * 100)}%` }}
                />
              </div>
              <div className="text-sm text-gray-400">
                Max deploy: <span className="text-gray-100 font-mono">${(bankroll - floorProtection).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Risk/Reward Table */}
          <div className="bg-[#111827] border border-gray-800 rounded-lg p-4">
            <h2 className="text-sm font-semibold text-gray-300 mb-3">Risk / Reward Table</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-gray-500 border-b border-gray-800">
                    <th className="text-left pb-2 font-medium">Contracts</th>
                    <th className="text-right pb-2 font-medium">Cost</th>
                    <th className="text-right pb-2 font-medium">Max Profit</th>
                    <th className="text-right pb-2 font-medium">Max Loss</th>
                    <th className="text-right pb-2 font-medium">ROI</th>
                    <th className="text-right pb-2 font-medium">% Bankroll</th>
                  </tr>
                </thead>
                <tbody>
                  {riskRewardRows.map((row) => {
                    const isSelected = row.count === contractCount
                    return (
                      <tr
                        key={row.count}
                        onClick={() => setContractCount(row.count)}
                        className={`border-b border-gray-800/50 cursor-pointer transition-colors ${
                          isSelected ? 'bg-emerald-500/5 border-emerald-500/20' : 'hover:bg-gray-800/30'
                        }`}
                      >
                        <td className={`py-2 font-mono font-bold ${isSelected ? 'text-emerald-400' : 'text-gray-300'}`}>
                          {row.count}
                        </td>
                        <td className="py-2 text-right font-mono text-gray-300">${row.cost.toFixed(2)}</td>
                        <td className="py-2 text-right font-mono text-emerald-400">+${row.maxProfit.toFixed(2)}</td>
                        <td className="py-2 text-right font-mono text-red-400">-${row.maxLoss.toFixed(2)}</td>
                        <td className="py-2 text-right font-mono text-gray-300">{row.roi}%</td>
                        <td className={`py-2 text-right font-mono ${parseFloat(row.pctBankroll) > 5 ? 'text-red-400' : 'text-gray-400'}`}>
                          {row.pctBankroll}%
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
