import { injuryReports, InjuryStatus } from '@/data/injuries'

function StatusBadge({ status }: { status: InjuryStatus }) {
  const styles = {
    OUT: 'bg-red-500/20 text-red-400 border border-red-500/40',
    QUESTIONABLE: 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/30',
    PROBABLE: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${styles[status]}`}>
      {status}
    </span>
  )
}

function LineMovementBadge({ expected, direction }: { expected: boolean; direction?: 'UP' | 'DOWN' }) {
  if (!expected) {
    return <span className="text-xs text-gray-600">No movement expected</span>
  }
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-bold ${
      direction === 'DOWN' ? 'text-red-400' : 'text-emerald-400'
    }`}>
      {direction === 'DOWN' ? '▼' : '▲'} Line movement expected
    </span>
  )
}

export default function InjuryIntel() {
  const outCount = injuryReports.filter((r) => r.status === 'OUT').length
  const qCount = injuryReports.filter((r) => r.status === 'QUESTIONABLE').length
  const movementCount = injuryReports.filter((r) => r.lineMovementExpected).length

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-100">Injury Intel Feed</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {injuryReports.length} reports · {movementCount} affecting lines
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
          <span className="text-xs text-gray-500">Auto-refreshing</span>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: 'OUT', count: outCount, color: 'text-red-400', bg: 'border-red-500/20' },
          { label: 'QUESTIONABLE', count: qCount, color: 'text-yellow-400', bg: 'border-yellow-500/20' },
          { label: 'Line Impact', count: movementCount, color: 'text-emerald-400', bg: 'border-emerald-500/20' },
        ].map((s) => (
          <div key={s.label} className={`bg-[#111827] border ${s.bg} rounded-lg p-4`}>
            <div className="text-xs text-gray-500 mb-1">{s.label}</div>
            <div className={`text-2xl font-bold font-mono ${s.color}`}>{s.count}</div>
          </div>
        ))}
      </div>

      {/* Injury Cards */}
      <div className="space-y-3">
        {injuryReports.map((report) => (
          <div
            key={report.id}
            className={`bg-[#111827] border rounded-lg p-4 ${
              report.status === 'OUT'
                ? 'border-red-500/30'
                : report.lineMovementExpected
                ? 'border-yellow-500/25'
                : 'border-gray-800'
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <span className="text-gray-100 font-semibold">{report.player}</span>
                  <span className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded font-mono">
                    {report.position} · {report.team}
                  </span>
                  <StatusBadge status={report.status} />
                </div>

                <div className="text-sm text-gray-400 mb-3">
                  <span className="text-gray-500">Injury: </span>
                  {report.injury}
                </div>

                <div className="text-sm text-gray-300 bg-[#0d1424] rounded px-3 py-2 mb-3 italic">
                  "{report.notes}"
                </div>

                <div className="flex items-center gap-4 flex-wrap">
                  <div>
                    <span className="text-xs text-gray-500 mr-2">Affected markets:</span>
                    {report.affectedMarkets.map((ticker) => (
                      <span key={ticker} className="text-xs font-mono bg-gray-800 text-gray-300 px-2 py-0.5 rounded mr-1">
                        {ticker.slice(-16)}
                      </span>
                    ))}
                  </div>

                  <LineMovementBadge
                    expected={report.lineMovementExpected}
                    direction={report.lineMovementDirection}
                  />
                </div>
              </div>

              <div className="text-right flex-shrink-0">
                <div className="text-xs text-gray-500">{report.reportedAt}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 text-xs text-gray-600 text-center">
        Injury data is mock/illustrative. For real trading, integrate official injury reports from ESPN, Rotoworld, or team sources.
      </div>
    </div>
  )
}
