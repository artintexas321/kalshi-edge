import { NextResponse } from 'next/server'

const KALSHI_BASE = 'https://trading-api.kalshi.com/trade-api/v2'

// Named player impact scores (0.0-0.30)
const PLAYER_IMPACT: Record<string, number> = {
  // NBA superstars
  'nikola jokic': 0.28, 'luka doncic': 0.27, 'giannis antetokounmpo': 0.26,
  'joel embiid': 0.25, 'victor wembanyama': 0.24, 'stephen curry': 0.24,
  'anthony davis': 0.23, 'shai gilgeous-alexander': 0.22, 'lebron james': 0.22,
  'kevin durant': 0.21, 'anthony edwards': 0.21, 'jayson tatum': 0.21,
  'kawhi leonard': 0.20, 'ja morant': 0.20, 'devin booker': 0.19,
  'damian lillard': 0.19, 'jalen brunson': 0.19, 'zion williamson': 0.19,
  'trae young': 0.18, 'tyrese haliburton': 0.18, 'jimmy butler': 0.18,
  'donovan mitchell': 0.17, 'karl-anthony towns': 0.17, 'paolo banchero': 0.17,
  'de\'aaron fox': 0.17, 'chet holmgren': 0.16, 'bam adebayo': 0.16,
  'darius garland': 0.16, 'tyrese maxey': 0.17, 'jaylen brown': 0.17,
  'pascal siakam': 0.16, 'domantas sabonis': 0.16, 'rudy gobert': 0.14,
  'kristaps porzingis': 0.15, 'lauri markkanen': 0.15,
  // NHL superstars
  'connor mcdavid': 0.30, 'nathan mackinnon': 0.28, 'auston matthews': 0.26,
  'leon draisaitl': 0.25, 'igor shesterkin': 0.24, 'cale makar': 0.22,
  'andrei vasilevskiy': 0.22, 'david pastrnak': 0.21, 'sidney crosby': 0.23,
  'alex ovechkin': 0.20, 'mikko rantanen': 0.19, 'matthew tkachuk': 0.19,
  'roman josi': 0.18, 'artemi panarin': 0.18, 'mitch marner': 0.18,
  'jason robertson': 0.17, 'jake guentzel': 0.16, 'john carlson': 0.15,
}

// Position fallback
const POSITION_IMPACT: Record<string, number> = {
  PG: 0.14, SG: 0.10, SF: 0.10, PF: 0.09, C: 0.09,
  G: 0.18, D: 0.08, LW: 0.07, RW: 0.07, DEFAULT: 0.08,
}

function getImpact(playerName: string, pos: string): { score: number; isStar: boolean } {
  const key = playerName.toLowerCase()
  // Try exact or partial match
  for (const [name, score] of Object.entries(PLAYER_IMPACT)) {
    if (key.includes(name) || name.includes(key)) {
      return { score, isStar: true }
    }
  }
  return { score: POSITION_IMPACT[pos] ?? POSITION_IMPACT.DEFAULT, isStar: false }
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
  yesAsk: number,
  team1: string,
  team2: string,
  injuries: { player: string; team: string; position: string; status: string }[]
) {
  let team1Prob = yesAsk
  let team2Prob = 1 - yesAsk

  const impacts: { player: string; team: string; delta: number; status: string; isStar: boolean }[] = []
  let team1Outs = 0, team2Outs = 0

  for (const inj of injuries) {
    const t = inj.team.toUpperCase()
    const isTeam1 = t === team1.toUpperCase()
    const isTeam2 = t === team2.toUpperCase()
    if (!isTeam1 && !isTeam2) continue

    const { score: baseImpact, isStar } = getImpact(inj.player, inj.position)
    const statusMultiplier = inj.status === 'Out' ? 1.0 : inj.status === 'Questionable' ? 0.5 : 0.2
    const delta = baseImpact * statusMultiplier

    if (isTeam1) {
      if (inj.status === 'Out') team1Outs++
      team1Prob = Math.max(0.05, team1Prob - delta)
      impacts.push({ player: inj.player, team: team1, delta: -delta, status: inj.status, isStar })
    } else {
      if (inj.status === 'Out') team2Outs++
      team2Prob = Math.max(0.05, team2Prob - delta)
      team1Prob = Math.min(0.95, team1Prob + delta * 0.7)
      impacts.push({ player: inj.player, team: team2, delta: -delta, status: inj.status, isStar })
    }
  }

  // Compound effect: 2+ starters out
  if (team1Outs >= 2) team1Prob = Math.max(0.05, team1Prob * 0.85)
  if (team2Outs >= 2) { team1Prob = Math.min(0.95, team1Prob * 1.12); team2Prob = Math.max(0.05, team2Prob * 0.85) }

  const total = team1Prob + team2Prob
  team1Prob = team1Prob / total

  const edgeAmount = team1Prob - yesAsk
  const edgePct = Math.abs(edgeAmount) * 100
  const hasStar = impacts.some(i => i.isStar)

  let kellyFraction = 0
  if (edgeAmount > 0 && yesAsk > 0 && yesAsk < 1) {
    const b = (1 / yesAsk) - 1
    kellyFraction = Math.max(0, (b * team1Prob - (1 - team1Prob)) / b) * 0.25
  } else if (edgeAmount < 0 && yesAsk > 0 && yesAsk < 1) {
    const b = (1 / (1 - yesAsk)) - 1
    kellyFraction = Math.max(0, (b * (1 - team1Prob) - team1Prob) / b) * 0.25
  }

  return {
    ourProb: team1Prob, marketProb: yesAsk, edgeAmount, edgePct, kellyFraction, impacts, hasStar,
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
        team1, team2, yesAsk,
        volume: market.volume ?? 0,
        closeTime: market.close_time ?? '',
        action: edge.action,
        confidence: edge.confidence,
        ourProb: Math.round(edge.ourProb * 100),
        marketProb: Math.round(edge.marketProb * 100),
        edgePct: Math.round(edge.edgePct * 10) / 10,
        kellyFraction: Math.round(edge.kellyFraction * 1000) / 1000,
        hasStar: edge.hasStar,
        injuries: relevantInjuries,
        reasoning: relevantInjuries.length > 0
          ? relevantInjuries.map(i =>
              `${i.isStar ? '⭐ ' : ''}${i.player} (${i.team}) — ${i.status}`
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
