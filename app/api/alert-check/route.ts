import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const ALERTS_FILE = path.join(process.cwd(), 'data', 'alerts.json')

function readAlerts() {
  try { return JSON.parse(fs.readFileSync(ALERTS_FILE, 'utf8')) } catch { return [] }
}

export async function POST(req: NextRequest) {
  try {
    const { contact } = await req.json()
    if (!contact) return NextResponse.json({ ok: false, error: 'No contact provided' }, { status: 400 })
    const alerts = readAlerts()
    if (!alerts.find((a: { contact: string }) => a.contact === contact)) {
      alerts.push({ contact, signedUpAt: new Date().toISOString() })
      fs.mkdirSync(path.dirname(ALERTS_FILE), { recursive: true })
      fs.writeFileSync(ALERTS_FILE, JSON.stringify(alerts, null, 2))
    }
    return NextResponse.json({ ok: true, message: 'You\'re on the list! SMS alerts coming soon.' })
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 })
  }
}

export async function GET() {
  const alerts = readAlerts()
  return NextResponse.json({ count: alerts.length })
}
