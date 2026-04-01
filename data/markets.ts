export interface Market {
  ticker: string
  sport: 'NBA' | 'NHL'
  matchup: string
  team: string
  opponent: string
  yesPrice: number
  noPrice: number
  volume: number
  closeTime: string
  status: 'open' | 'closing_soon'
  edge: boolean
  edgeScore: number
  gameTime: string
}

export interface Position {
  id: string
  ticker: string
  matchup: string
  side: 'YES' | 'NO'
  contracts: number
  avgCost: number
  currentPrice: number
  status: 'open' | 'closed'
  result?: 'win' | 'loss'
  openedAt: string
  closedAt?: string
}

export interface Injury {
  player: string
  team: string
  position: string
  status: 'OUT' | 'QUESTIONABLE' | 'PROBABLE'
  injury: string
  affectedMarkets: string[]
  lineMovement: 'expected' | 'already_moved' | 'minimal'
  reportedAt: string
}

export const markets: Market[] = [
  {
    ticker: 'KXNBAGAME-26APR01-OKC',
    sport: 'NBA',
    matchup: 'OKC Thunder vs. Dallas Mavericks',
    team: 'OKC Thunder',
    opponent: 'Dallas Mavericks',
    yesPrice: 0.72,
    noPrice: 0.30,
    volume: 148420,
    closeTime: '19:30 CT',
    status: 'open',
    edge: false,
    edgeScore: 3,
    gameTime: 'Tonight 7:30 PM CT'
  },
  {
    ticker: 'KXNBAGAME-26APR01-BOS',
    sport: 'NBA',
    matchup: 'Boston Celtics vs. Miami Heat',
    team: 'Boston Celtics',
    opponent: 'Miami Heat',
    yesPrice: 0.61,
    noPrice: 0.41,
    volume: 203850,
    closeTime: '19:30 CT',
    status: 'open',
    edge: true,
    edgeScore: 8,
    gameTime: 'Tonight 7:30 PM CT'
  },
  {
    ticker: 'KXNBAGAME-26APR01-DEN',
    sport: 'NBA',
    matchup: 'Denver Nuggets vs. LA Clippers',
    team: 'Denver Nuggets',
    opponent: 'LA Clippers',
    yesPrice: 0.58,
    noPrice: 0.44,
    volume: 89230,
    closeTime: '21:00 CT',
    status: 'open',
    edge: true,
    edgeScore: 7,
    gameTime: 'Tonight 9:00 PM CT'
  },
  {
    ticker: 'KXNBAGAME-26APR01-GSW',
    sport: 'NBA',
    matchup: 'Golden State Warriors vs. Sacramento Kings',
    team: 'Golden State Warriors',
    opponent: 'Sacramento Kings',
    yesPrice: 0.44,
    noPrice: 0.58,
    volume: 67410,
    closeTime: '21:00 CT',
    status: 'open',
    edge: false,
    edgeScore: 2,
    gameTime: 'Tonight 9:00 PM CT'
  },
  {
    ticker: 'KXNHLGAME-26APR01-FLA',
    sport: 'NHL',
    matchup: 'Florida Panthers vs. Tampa Bay Lightning',
    team: 'Florida Panthers',
    opponent: 'Tampa Bay Lightning',
    yesPrice: 0.62,
    noPrice: 0.40,
    volume: 44180,
    closeTime: '18:00 CT',
    status: 'closing_soon',
    edge: true,
    edgeScore: 9,
    gameTime: 'Tonight 6:00 PM CT'
  },
  {
    ticker: 'KXNHLGAME-26APR01-COL',
    sport: 'NHL',
    matchup: 'Colorado Avalanche vs. Vegas Golden Knights',
    team: 'Colorado Avalanche',
    opponent: 'Vegas Golden Knights',
    yesPrice: 0.55,
    noPrice: 0.47,
    volume: 31950,
    closeTime: '20:00 CT',
    status: 'open',
    edge: false,
    edgeScore: 5,
    gameTime: 'Tonight 8:00 PM CT'
  },
  {
    ticker: 'KXNBAGAME-26APR02-MIL',
    sport: 'NBA',
    matchup: 'Milwaukee Bucks vs. Indiana Pacers',
    team: 'Milwaukee Bucks',
    opponent: 'Indiana Pacers',
    yesPrice: 0.63,
    noPrice: 0.39,
    volume: 55720,
    closeTime: 'Tomorrow 18:00 CT',
    status: 'open',
    edge: true,
    edgeScore: 7,
    gameTime: 'Tomorrow 6:00 PM CT'
  },
]

export const positions: Position[] = [
  {
    id: '1',
    ticker: 'KXNBAGAME-26MAR29-OKC',
    matchup: 'OKC Thunder vs. NY Knicks',
    side: 'YES',
    contracts: 3,
    avgCost: 0.74,
    currentPrice: 1.00,
    status: 'closed',
    result: 'win',
    openedAt: '03/29/2026',
    closedAt: '03/29/2026'
  },
  {
    id: '2',
    ticker: 'KXNBAGAME-26MAR29-DEN',
    matchup: 'Denver Nuggets vs. Golden State Warriors',
    side: 'YES',
    contracts: 8,
    avgCost: 0.86,
    currentPrice: 0.00,
    status: 'closed',
    result: 'loss',
    openedAt: '03/29/2026',
    closedAt: '03/29/2026'
  },
  {
    id: '3',
    ticker: 'KXSPURS-26CHAMP',
    matchup: 'San Antonio Spurs — 2026 NBA Champion',
    side: 'YES',
    contracts: 3776,
    avgCost: 0.15,
    currentPrice: 0.17,
    status: 'open',
    openedAt: '02/15/2026'
  },
  {
    id: '4',
    ticker: 'KXNCAA-26CHAMP-AZ',
    matchup: 'Arizona Wildcats — 2026 NCAA Champion',
    side: 'YES',
    contracts: 66,
    avgCost: 0.36,
    currentPrice: 0.68,
    status: 'open',
    openedAt: '03/22/2026'
  },
]

export const injuries: Injury[] = [
  {
    player: 'Jaylen Brown',
    team: 'Boston Celtics',
    position: 'SG',
    status: 'QUESTIONABLE',
    injury: 'Left ankle sprain',
    affectedMarkets: ['KXNBAGAME-26APR01-BOS'],
    lineMovement: 'already_moved',
    reportedAt: '2h ago'
  },
  {
    player: 'Nikola Jokic',
    team: 'Denver Nuggets',
    position: 'C',
    status: 'PROBABLE',
    injury: 'Back tightness',
    affectedMarkets: ['KXNBAGAME-26APR01-DEN'],
    lineMovement: 'minimal',
    reportedAt: '4h ago'
  },
  {
    player: 'Stephen Curry',
    team: 'Golden State Warriors',
    position: 'PG',
    status: 'OUT',
    injury: 'Right hand fracture',
    affectedMarkets: ['KXNBAGAME-26APR01-GSW', 'KXNBAGAME-26APR02-GSW'],
    lineMovement: 'already_moved',
    reportedAt: 'Yesterday'
  },
  {
    player: 'Matthew Tkachuk',
    team: 'Florida Panthers',
    position: 'LW',
    status: 'QUESTIONABLE',
    injury: 'Upper body',
    affectedMarkets: ['KXNHLGAME-26APR01-FLA'],
    lineMovement: 'expected',
    reportedAt: '1h ago'
  },
  {
    player: 'Luka Doncic',
    team: 'Dallas Mavericks',
    position: 'PG',
    status: 'OUT',
    injury: 'Left calf strain',
    affectedMarkets: ['KXNBAGAME-26APR01-OKC'],
    lineMovement: 'already_moved',
    reportedAt: '3 days ago'
  },
]

export const portfolioHistory = [
  { date: 'Mar 1', value: 500 },
  { date: 'Mar 5', value: 487 },
  { date: 'Mar 8', value: 521 },
  { date: 'Mar 12', value: 498 },
  { date: 'Mar 15', value: 545 },
  { date: 'Mar 19', value: 612 },
  { date: 'Mar 22', value: 589 },
  { date: 'Mar 25', value: 643 },
  { date: 'Mar 29', value: 702 },
  { date: 'Mar 31', value: 702 },
]
