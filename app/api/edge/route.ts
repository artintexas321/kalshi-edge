import { NextResponse } from 'next/server'

const KALSHI_BASE = 'https://trading-api.kalshi.com/trade-api/v2'

// Key player impact weights by position
const IMPACT = {
  // NBA
  PG: 0.14, SG: 0.10, SF: 0.10, PF: 0.09, C: 0.09,
  // NHL
  G: 0.18, D: 0.08, LW: 0.07, RW: 0.07, C: 0.09,
  // Default
  DEFAULT: 0.08
} as const

function getImpact(pos: string): number {
  return IMPACT[pos as keyof typeof IMPACT] ?? IMPACT.DEFAULT
}

async function fetchMarkets(series: string) {
  try {
    const res = await fetch(`${KALSHI_BASE}/markets?series_ticker=${series}&limit=50&status=open`, {
      next: { revalidate: 60 }
    })
    if (!res.ok) return []
    const d = await res.json()
    return d.markets ?? []
  } catch { return [] }
}

async function fetchInjuries(sport: string, league: string) {
  try {
    const res = await fetch(
      `https://site.api.espn.com/apis/site/v2/sports/${sport}/${league}/injuries`,
      { next: { revalidate: 300 } }
    )
    if (!res.ok) return []
    const d = await res.json()
    const out: { player: string; team: string; position: string; status: string }[] = []
    for (const team of (d.injuries ?? [])) {
      for (const inj of (team.injuries ?? [])) {
        out.push({
          player: inj.athlete?.displayName ?? '',
          team: team.team?.abbreviation ?? '',
          position: inj.athlete?.position?.abbreviation ?? 'DEFAULT',
          status: inj.status ?? '',
        })
      }
    }
    return out
  } catch { return [] }
}

// Extract team abbreviations from a Kalshi market title
// e.g. "Will OKC win vs NYK?" → ['OKC', 'NYK']
function extractTeams(title: string): [string, string] {
  const m = title.match(/([A-Z]{2,4})\s+(?:win|vs|@|-)\s+([A-Z]{2,4})/i)
  if (m) return [m[1].toUpperCase(), m[2].toUpperCase()]
  // Try ticker: KXNBAGAME-25APR1-OKC
  const t = title.match(/([A-Z]{2,4})-([A-Z]{2,4})$/)
  if (t) return [t[1], t[2]]
  return ['', '']
}

function calcEdge(
  yesAsk: number, // market's implied prob (0-1)
  team1: string,
  team2: string,
  injuries: { player: string; team: string; position: string; status: string }[]
) {
  let team1Prob = yesAsk  // market's current price for team1 win
  let team2Prob = 1 - yesAsk

  const impacts: { player: string; team: string; delta: number; status: string }[] = []

  for (const inj of injuries) {
    const t = inj.team.toUpperCase()
    const isTeam1 = t === team1.toUpperCase()
    const isTeam2 = t === team2.toUpperCase()
    if (!isTeam1 && !isTeam2) continue

    const baseImpact = getImpact(inj.position)
    const statusMultiplier = inj.status === 'Out' ? 1.0 : inj.status === 'Questionable' ? 0.5 : 0.2
    const delta = baseImpact * statusMultiplier

    if (isTeam1) {
      team1Prob = Math.max(0.05, team1Prob - delta)
      impacts.push({ player: inj.player, team: team1, delta: -delta, status: inj.status })
    } else {
      team2Prob = Math.max(0.05, team2Prob - delta)
      team1Prob = Math.min(0.95, team1Prob + delta * 0.7)
      impacts.push({ player: inj.player, team: team2, delta: -delta, status: inj.status })
    }
  }

  // Normalize
  const total = team1Prob + team2Prob
  team1Prob = team1Prob / total

  const edgeAmount = team1Prob - yesAsk
  const edgePct = Math.abs(edgeAmount) * 100

  // Kelly (quarter kelly)
  let kellyFraction = 0
  if (edgeAmount > 0 && yesAsk > 0 && yesAsk < 1) {
    const b = (1 / yesAsk) - 1
    kellyFraction = Math.max(0, (b * team1Prob - (1 - team1Prob)) / b) * 0.25
  } else if (edgeAmount < 0 && yesAsk > 0 && yesAsk < 1) {
    const b = (1 / (1 - yesAsk)) - 1
    kellyFraction = Math.max(0, (b * (1 - team1Prob) - team1Prob) / b) * 0.25
  }

  return {
    ourProb: team1Prob,
    marketProb: yesAsk,
    edgeAmount,
    edgePct,
    kellyFraction,
    impacts,
    action: edgePct < 3 ? 'PASS' : edgeAmount > 0 ? 'BET YES' : 'BET NO',
    confidence: edgePct >= 10 ? 'HIGH' : edgePct >= 5 ? 'MEDIUM' : 'LOW',
  }
}

export async function GET() {
  try {
    const [nbaMarkets, nhlMarkets, nbaInjuries, nhlInjuries] = await Promise.all([
      fetchMarkets('KXNBAGAME'),
      fetchMarkets('KXNHLGAME'),
      fetchInjuries('basketball', 'nba'),
      fetchInjuries('hockey', 'nhl'),
    ])

    const picks = []

    for (const market of [...nbaMarkets, ...nhlMarkets]) {
      const isNBA = market.series_ticker === 'KXNBAGAME'
      const injuries = isNBA ? nbaInjuries : nhlInjuries

      const yesAsk = market.yes_ask ? market.yes_ask / 100 : null
      if (!yesAsk || yesAsk <= 0 || yesAsk >= 1) continue

      const [team1, team2] = extractTeams(market.title ?? market.ticker)
      if (!team1 || !team2) continue

      const edge = calcEdge(yesAsk, team1, team2, injuries)
      const relevantInjuries = edge.impacts.filter(i => Math.abs(i.delta) >= 0.03)

      picks.push({
        ticker: market.ticker,
        title: market.title ?? market.ticker,
        sport: isNBA ? 'NBA' : 'NHL',
        team1,
        team2,
        yesAsk,
        volume: market.volume ?? 0,
        closeTime: market.close_time ?? '',
        action: edge.action,
        confidence: edge.confidence,
        ourProb: Math.round(edge.ourProb * 100),
        marketProb: Math.round(edge.marketProb * 100),
        edgePct: Math.round(edge.edgePct * 10) / 10,
        kellyFraction: Math.round(edge.kellyFraction * 1000) / 1000,
        injuries: relevantInjuries,
        reasoning: relevantInjuries.length > 0
          ? relevantInjuries.map(i =>
              `${i.player} (${i.team}) — ${i.status}${i.delta < 0 ? ', reduces win prob' : ''}`
            ).join('; ')
          : 'No significant injury flags — market price accepted',
      })
    }

    // Sort: HIGH confidence BET first, then MEDIUM, then PASS
    picks.sort((a, b) => {
      const rank = (p: typeof picks[0]) =>
        p.action !== 'PASS' && p.confidence === 'HIGH' ? 0 :
        p.action !== 'PASS' && p.confidence === 'MEDIUM' ? 1 :
        p.action !== 'PASS' ? 2 : 3
      return rank(a) - rank(b)
    })

    return NextResponse.json({ picks, live: true, count: picks.length })
  } catch (err) {
    return NextResponse.json({ picks: [], live: false, error: String(err) })
  }
}
