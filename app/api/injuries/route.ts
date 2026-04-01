import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // ESPN free public API - no key needed
    const [nbaRes, nhlRes] = await Promise.all([
      fetch('https://site.api.espn.com/apis/site/v2/sports/basketball/nba/injuries', {
        next: { revalidate: 300 }
      }),
      fetch('https://site.api.espn.com/apis/site/v2/sports/hockey/nhl/injuries', {
        next: { revalidate: 300 }
      })
    ])

    const injuries: object[] = []

    if (nbaRes.ok) {
      const data = await nbaRes.json()
      const teams = data.injuries ?? []
      for (const team of teams) {
        for (const injury of (team.injuries ?? [])) {
          const athlete = injury.athlete ?? {}
          const status = injury.status ?? 'UNKNOWN'
          injuries.push({
            player: athlete.displayName ?? 'Unknown',
            team: team.team?.abbreviation ?? '',
            position: athlete.position?.abbreviation ?? '',
            injury: injury.type ?? injury.longComment ?? 'Undisclosed',
            status: status === 'Out' ? 'OUT' : status === 'Questionable' ? 'QUESTIONABLE' : status === 'Probable' ? 'PROBABLE' : status.toUpperCase(),
            reportedAt: injury.date ?? 'Today',
            sport: 'NBA',
            lineMovement: status === 'Out' ? 'expected' : status === 'Questionable' ? 'expected' : 'already_moved',
            affectedMarkets: [],
          })
        }
      }
    }

    if (nhlRes.ok) {
      const data = await nhlRes.json()
      const teams = data.injuries ?? []
      for (const team of teams) {
        for (const injury of (team.injuries ?? [])) {
          const athlete = injury.athlete ?? {}
          const status = injury.status ?? 'UNKNOWN'
          injuries.push({
            player: athlete.displayName ?? 'Unknown',
            team: team.team?.abbreviation ?? '',
            position: athlete.position?.abbreviation ?? '',
            injury: injury.type ?? injury.longComment ?? 'Undisclosed',
            status: status === 'Out' ? 'OUT' : status === 'Questionable' ? 'QUESTIONABLE' : status === 'Probable' ? 'PROBABLE' : status.toUpperCase(),
            reportedAt: injury.date ?? 'Today',
            sport: 'NHL',
            lineMovement: status === 'Out' ? 'expected' : 'already_moved',
            affectedMarkets: [],
          })
        }
      }
    }

    return NextResponse.json({ injuries, live: true, count: injuries.length })
  } catch (err) {
    return NextResponse.json({ injuries: [], live: false, error: String(err) })
  }
}
