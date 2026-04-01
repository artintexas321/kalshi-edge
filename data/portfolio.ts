export interface Position {
  id: string
  ticker: string
  matchup: string
  side: 'YES' | 'NO'
  contracts: number
  avgCost: number
  currentPrice: number
  status: 'OPEN' | 'CLOSED'
  result?: 'WIN' | 'LOSS'
  closedAt?: number
  openedAt: string
}

export interface PortfolioSnapshot {
  date: string
  value: number
}

export const openPositions: Position[] = [
  {
    id: 'p1',
    ticker: 'KXNBAGAME-25APR01-CELTICS',
    matchup: 'BOS Celtics to win',
    side: 'YES',
    contracts: 25,
    avgCost: 0.59,
    currentPrice: 0.62,
    status: 'OPEN',
    openedAt: '2025-03-31T14:22:00Z',
  },
  {
    id: 'p2',
    ticker: 'KXNHLGAME-25APR01-BRUINS',
    matchup: 'BOS Bruins to win',
    side: 'YES',
    contracts: 40,
    avgCost: 0.56,
    currentPrice: 0.59,
    status: 'OPEN',
    openedAt: '2025-03-31T16:05:00Z',
  },
  {
    id: 'p3',
    ticker: 'KXNBAGAME-25APR01-BUCKS',
    matchup: 'MIL Bucks to win',
    side: 'YES',
    contracts: 15,
    avgCost: 0.60,
    currentPrice: 0.58,
    status: 'OPEN',
    openedAt: '2025-03-31T17:30:00Z',
  },
  {
    id: 'p4',
    ticker: 'KXNHLGAME-25APR01-AVALANCHE',
    matchup: 'COL Avalanche to win',
    side: 'YES',
    contracts: 30,
    avgCost: 0.52,
    currentPrice: 0.55,
    status: 'OPEN',
    openedAt: '2025-03-30T20:14:00Z',
  },
]

export const closedPositions: Position[] = [
  {
    id: 'c1',
    ticker: 'KXNBAGAME-25MAR30-THUNDER',
    matchup: 'OKC Thunder to win',
    side: 'YES',
    contracts: 20,
    avgCost: 0.61,
    currentPrice: 1.0,
    status: 'CLOSED',
    result: 'WIN',
    closedAt: 1.0,
    openedAt: '2025-03-29T22:00:00Z',
  },
  {
    id: 'c2',
    ticker: 'KXNHLGAME-25MAR29-LEAFS',
    matchup: 'TOR Maple Leafs to win',
    side: 'YES',
    contracts: 35,
    avgCost: 0.57,
    currentPrice: 0.0,
    status: 'CLOSED',
    result: 'LOSS',
    closedAt: 0.0,
    openedAt: '2025-03-28T21:00:00Z',
  },
  {
    id: 'c3',
    ticker: 'KXNBAGAME-25MAR28-HEAT',
    matchup: 'MIA Heat to win',
    side: 'NO',
    contracts: 18,
    avgCost: 0.38,
    currentPrice: 1.0,
    status: 'CLOSED',
    result: 'WIN',
    closedAt: 1.0,
    openedAt: '2025-03-27T23:00:00Z',
  },
  {
    id: 'c4',
    ticker: 'KXNBAGAME-25MAR27-CELTICS',
    matchup: 'BOS Celtics to win',
    side: 'YES',
    contracts: 22,
    avgCost: 0.64,
    currentPrice: 1.0,
    status: 'CLOSED',
    result: 'WIN',
    closedAt: 1.0,
    openedAt: '2025-03-26T22:00:00Z',
  },
]

export const portfolioHistory: PortfolioSnapshot[] = [
  { date: 'Mar 24', value: 1000 },
  { date: 'Mar 25', value: 1045 },
  { date: 'Mar 26', value: 1023 },
  { date: 'Mar 27', value: 1087 },
  { date: 'Mar 28', value: 1134 },
  { date: 'Mar 29', value: 1098 },
  { date: 'Mar 30', value: 1162 },
  { date: 'Mar 31', value: 1241 },
]

export const STARTING_BANKROLL = 1000
export const CURRENT_VALUE = 1241
