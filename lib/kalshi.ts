const BASE = 'https://trading-api.kalshi.com/trade-api/v2'

export interface KalshiMarket {
  ticker: string
  title: string
  yes_bid: number
  yes_ask: number
  no_bid: number
  no_ask: number
  volume: number
  close_time: string
  status: string
  series_ticker: string
}

export interface KalshiPosition {
  ticker: string
  position: number
  market_exposure: number
  realized_pnl: number
  unrealized_pnl: number
  total_cost: number
  fees_paid: number
}

export interface KalshiBalance {
  balance: number
  payout: number
}

async function kalshiGet(path: string, apiKey: string) {
  const res = await fetch(`${BASE}${path}`, {
    headers: {
      Authorization: apiKey,
      'Content-Type': 'application/json',
    },
    next: { revalidate: 30 },
  })
  if (!res.ok) throw new Error(`Kalshi API ${res.status}: ${await res.text()}`)
  return res.json()
}

export async function getMarkets(seriesTicker: string, apiKey?: string): Promise<KalshiMarket[]> {
  const key = apiKey || process.env.KALSHI_API_KEY || ''
  const data = await kalshiGet(`/markets?series_ticker=${seriesTicker}&limit=50&status=open`, key)
  return data.markets ?? []
}

export async function getMarket(ticker: string, apiKey?: string): Promise<KalshiMarket> {
  const key = apiKey || process.env.KALSHI_API_KEY || ''
  const data = await kalshiGet(`/markets/${ticker}`, key)
  return data.market
}

export async function getPositions(apiKey: string): Promise<KalshiPosition[]> {
  const data = await kalshiGet('/portfolio/positions', apiKey)
  return data.market_positions ?? []
}

export async function getBalance(apiKey: string): Promise<KalshiBalance> {
  const data = await kalshiGet('/portfolio/balance', apiKey)
  return data
}
