import { NextRequest, NextResponse } from 'next/server'
import { getPositions, getBalance } from '@/lib/kalshi'

export async function GET(req: NextRequest) {
  const apiKey = req.headers.get('x-kalshi-key') || ''
  if (!apiKey) {
    return NextResponse.json({ error: 'No API key provided' }, { status: 401 })
  }
  try {
    const [positions, balance] = await Promise.all([
      getPositions(apiKey),
      getBalance(apiKey),
    ])
    return NextResponse.json({ positions, balance, live: true })
  } catch (err) {
    return NextResponse.json({ error: String(err), live: false }, { status: 500 })
  }
}
