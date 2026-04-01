import { NextResponse } from 'next/server'
import { getMarkets } from '@/lib/kalshi'

export async function GET() {
  try {
    const [nba, nhl] = await Promise.all([
      getMarkets('KXNBAGAME').catch(() => []),
      getMarkets('KXNHLGAME').catch(() => []),
    ])
    const markets = [...nba, ...nhl]
    return NextResponse.json({ markets, live: true })
  } catch (err) {
    return NextResponse.json({ markets: [], live: false, error: String(err) })
  }
}
