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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const picks = readPicks()
    const existing = picks.findIndex((p: { ticker: string }) => p.ticker === body.ticker)
    if (existing >= 0) {
      return NextResponse.json({ ok: true, message: 'Already tracked' })
    }
    picks.push({ ...body, trackedAt: new Date().toISOString(), status: 'open', result: null, payout: null })
    writePicks(picks)
    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 })
  }
}
