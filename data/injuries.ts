export type InjuryStatus = 'OUT' | 'QUESTIONABLE' | 'PROBABLE'

export interface InjuryReport {
  id: string
  player: string
  team: string
  position: string
  status: InjuryStatus
  injury: string
  affectedMarkets: string[]
  lineMovementExpected: boolean
  lineMovementDirection?: 'DOWN' | 'UP'
  reportedAt: string
  notes: string
}

export const injuryReports: InjuryReport[] = [
  {
    id: 'i1',
    player: 'Jaylen Brown',
    team: 'BOS Celtics',
    position: 'SG',
    status: 'QUESTIONABLE',
    injury: 'Left ankle sprain',
    affectedMarkets: ['KXNBAGAME-25APR01-CELTICS'],
    lineMovementExpected: true,
    lineMovementDirection: 'DOWN',
    reportedAt: '45 min ago',
    notes: 'Limited in shootaround. Game-time decision.',
  },
  {
    id: 'i2',
    player: 'Nikola Jokic',
    team: 'DEN Nuggets',
    position: 'C',
    status: 'PROBABLE',
    injury: 'Right wrist soreness',
    affectedMarkets: ['KXNBAGAME-25APR01-NUGGETS'],
    lineMovementExpected: false,
    reportedAt: '2 hrs ago',
    notes: 'Practiced fully. Expected to play.',
  },
  {
    id: 'i3',
    player: 'Gabe Vincent',
    team: 'MIA Heat',
    position: 'PG',
    status: 'OUT',
    injury: 'Knee surgery recovery',
    affectedMarkets: ['KXNBAGAME-25APR01-CELTICS'],
    lineMovementExpected: true,
    lineMovementDirection: 'UP',
    reportedAt: '1 hr ago',
    notes: 'Officially ruled out for remainder of season.',
  },
  {
    id: 'i4',
    player: 'Nathan MacKinnon',
    team: 'COL Avalanche',
    position: 'C',
    status: 'QUESTIONABLE',
    injury: 'Upper body injury',
    affectedMarkets: ['KXNHLGAME-25APR01-AVALANCHE'],
    lineMovementExpected: true,
    lineMovementDirection: 'DOWN',
    reportedAt: '3 hrs ago',
    notes: 'Did not practice. Coach says "day-to-day".',
  },
  {
    id: 'i5',
    player: 'Damian Lillard',
    team: 'MIL Bucks',
    position: 'PG',
    status: 'PROBABLE',
    injury: 'Achilles tendon maintenance',
    affectedMarkets: ['KXNBAGAME-25APR01-BUCKS'],
    lineMovementExpected: false,
    reportedAt: '30 min ago',
    notes: 'Cleared by medical staff. Will play on minutes restriction.',
  },
]
