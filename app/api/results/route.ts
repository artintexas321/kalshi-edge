import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const PICKS_FILE = path.join(process.cwd(), 'data', 'picks.json')

function readPicks() {
  try {
    return JSON.parse(fs.readFileSync(PICKS_FILE, 'utf8'))
  } catch { return [] }
}

function writePicks(picks: object[]) {
  fs.mkdirSync(path.dirname(PICKS_FILE), { recursive: true })
  fs.writeFileSync(PICKS_FILE, JSON.stringify(picks, null, 2))
}

export async function GET() {
  const picks = readPicks()
  const closed = picks.filter((p: { status: string }) => p.status !== 'open')
  const wins = closed.filter((p: { result: string }) => p.result === 'win').length
  const losses = closed.filter((p: { result: string }) => p.result === 'loss').length
  const totalCost = closed.reduce((s: number, p: { cost?: number }) => s + (p.cost ?? 0), 0)
  const totalPayout = closed.reduce((s: number, p: { payout?: number }) => s + (p.payout ?? 0), 0)
  const pnl = totalPayout - totalCost
  const roi = totalCost > 0 ? ((pnl / totalCost) * 100).toFixed(1) : '0.0'
  const winRate = closed.length > 0 ? ((wins / closed.length) * 100).toFixed(1) : '0.0'

  return NextResponse.json({
    picks,
    stats: { total: picks.length, open: picks.filter((p: { status: string }) => p.status === 'open').length, wins, losses, winRate, pnl: pnl.toFixed(2), roi }
  })
}

export async function POST(req: NextRequest) {
  try {
    const { ticker, result, payout } = await req.json()
    const picks = readPicks()
    const idx = picks.findIndex((p: { ticker: string }) => p.ticker === ticker)
    if (idx < 0) return NextResponse.json({ ok: false, error: 'Pick not found' }, { status: 404 })
    picks[idx].result = result
    picks[idx].status = result
    picks[idx].payout = payout ?? 0
    picks[idx].closedAt = new Date().toISOString()
    writePicks(picks)
    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 })
  }
}
