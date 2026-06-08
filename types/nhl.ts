export interface LocalizedString {
  default: string
  fr?: string
  cs?: string
  fi?: string
  sk?: string
  sv?: string
}

export interface StatLeader {
  id: number
  firstName: LocalizedString
  lastName: LocalizedString
  sweaterNumber: number
  headshot: string
  teamAbbrev: string
  teamName: LocalizedString
  teamLogo: string
  position: string
  value: number
}

export interface StatLeadersResponse {
  points: StatLeader[]
  goals: StatLeader[]
  assists: StatLeader[]
}

export interface StandingTeam {
  teamAbbrev: { default: string }
  teamName: LocalizedString
  teamCommonName: LocalizedString
  teamLogo: string
  conferenceName: string
  conferenceAbbrev: string
  divisionName: string
  divisionAbbrev: string
  divisionSequence: number
  conferenceSequence: number
  wildcardSequence: number
  seasonId: number
  gamesPlayed: number
  wins: number
  losses: number
  otLosses: number
  points: number
  pointPctg: number
  regulationWins: number
  goalFor: number
  goalAgainst: number
  goalDifferential: number
  streakCode: string
  streakCount: number
  clinchIndicator?: string
}

export interface StandingsResponse {
  standings: StandingTeam[]
}

export interface SkaterStat {
  playerId: number
  headshot: string
  firstName: LocalizedString
  lastName: LocalizedString
  positionCode: string
  gamesPlayed: number
  goals: number
  assists: number
  points: number
  plusMinus: number
  penaltyMinutes: number
  powerPlayGoals: number
  shorthandedGoals: number
  gameWinningGoals: number
  overtimeGoals: number
  shots: number
  shootingPctg: number
  avgTimeOnIcePerGame: number
  faceoffWinPctg: number
}

export interface ClubStatsResponse {
  season: number
  gameType: number
  skaters: SkaterStat[]
  goalies: GoalieStat[]
}

export interface GoalieStat {
  playerId: number
  headshot: string
  firstName: LocalizedString
  lastName: LocalizedString
  gamesPlayed: number
  gamesStarted: number
  wins: number
  losses: number
  otLosses: number
  goalsAgainst: number
  shotsAgainst: number
  savePctg: number
  goalsAgainstAvg: number
  shutouts: number
}

export interface PlayerSeasonTotal {
  season: number
  gameTypeId: number
  leagueAbbrev: string
  sequence?: number
  gamesPlayed: number
  goals: number
  assists: number
  points: number
  plusMinus?: number
  pim?: number
  penaltyMinutes?: number
  powerPlayGoals?: number
  powerPlayPoints?: number
  shorthandedGoals?: number
  shorthandedPoints?: number
  gameWinningGoals?: number
  otGoals?: number
  shots?: number
  shootingPctg?: number
  faceoffWinningPctg?: number
  avgToi?: string
  teamCommonName?: LocalizedString
  teamName?: LocalizedString
  teamPlaceNameWithPreposition?: LocalizedString
}

export interface PlayerAwardSeason {
  seasonId: number
  gamesPlayed?: number
  goals?: number
  assists?: number
  points?: number
}

export interface PlayerAward {
  trophy: LocalizedString
  seasons: PlayerAwardSeason[]
}

export interface PlayerDraftDetails {
  year: number
  teamAbbrev: string
  round: number
  pickInRound: number
  overallPick: number
}

export interface PlayerDetail {
  playerId: number
  isActive: boolean
  currentTeamId?: number
  currentTeamAbbrev?: string
  fullTeamName?: LocalizedString
  teamCommonName?: LocalizedString
  firstName: LocalizedString
  lastName: LocalizedString
  sweaterNumber?: number
  position: string
  headshot: string
  heroImage?: string
  heightInInches: number
  heightInCentimeters: number
  weightInPounds: number
  weightInKilograms: number
  birthDate: string
  birthCity?: LocalizedString
  birthStateProvince?: LocalizedString
  birthCountry: string
  shootsCatches?: string
  teamLogo?: string
  inHHOF?: boolean
  draftDetails?: PlayerDraftDetails
  awards?: PlayerAward[]
  seasonTotals: PlayerSeasonTotal[]
}

export interface PlayerSearchResult {
  playerId: number
  name: string
  teamAbbrev: string
  position: string
  headshot: string
}

export interface RosterPlayerWithTeam extends RosterPlayer {
  teamAbbrev: string
  teamName: string
  teamLogo: string
}

export interface RosterPlayer {
  id: number
  headshot: string
  firstName: LocalizedString
  lastName: LocalizedString
  sweaterNumber: number
  positionCode: string
  shootsCatches: string
  heightInInches: number
  weightInPounds: number
  birthDate: string
  birthCountry: string
}

export interface RosterResponse {
  forwards: RosterPlayer[]
  defensemen: RosterPlayer[]
  goalies: RosterPlayer[]
}

export const NHL_TEAMS = [
  { abbrev: 'ANA', name: 'Anaheim Ducks', division: 'Pacific', conference: 'Western' },
  { abbrev: 'BOS', name: 'Boston Bruins', division: 'Atlantic', conference: 'Eastern' },
  { abbrev: 'BUF', name: 'Buffalo Sabres', division: 'Atlantic', conference: 'Eastern' },
  { abbrev: 'CGY', name: 'Calgary Flames', division: 'Pacific', conference: 'Western' },
  { abbrev: 'CAR', name: 'Carolina Hurricanes', division: 'Metropolitan', conference: 'Eastern' },
  { abbrev: 'CHI', name: 'Chicago Blackhawks', division: 'Central', conference: 'Western' },
  { abbrev: 'COL', name: 'Colorado Avalanche', division: 'Central', conference: 'Western' },
  { abbrev: 'CBJ', name: 'Columbus Blue Jackets', division: 'Metropolitan', conference: 'Eastern' },
  { abbrev: 'DAL', name: 'Dallas Stars', division: 'Central', conference: 'Western' },
  { abbrev: 'DET', name: 'Detroit Red Wings', division: 'Atlantic', conference: 'Eastern' },
  { abbrev: 'EDM', name: 'Edmonton Oilers', division: 'Pacific', conference: 'Western' },
  { abbrev: 'FLA', name: 'Florida Panthers', division: 'Atlantic', conference: 'Eastern' },
  { abbrev: 'LAK', name: 'Los Angeles Kings', division: 'Pacific', conference: 'Western' },
  { abbrev: 'MIN', name: 'Minnesota Wild', division: 'Central', conference: 'Western' },
  { abbrev: 'MTL', name: 'Montreal Canadiens', division: 'Atlantic', conference: 'Eastern' },
  { abbrev: 'NSH', name: 'Nashville Predators', division: 'Central', conference: 'Western' },
  { abbrev: 'NJD', name: 'New Jersey Devils', division: 'Metropolitan', conference: 'Eastern' },
  { abbrev: 'NYI', name: 'New York Islanders', division: 'Metropolitan', conference: 'Eastern' },
  { abbrev: 'NYR', name: 'New York Rangers', division: 'Metropolitan', conference: 'Eastern' },
  { abbrev: 'OTT', name: 'Ottawa Senators', division: 'Atlantic', conference: 'Eastern' },
  { abbrev: 'PHI', name: 'Philadelphia Flyers', division: 'Metropolitan', conference: 'Eastern' },
  { abbrev: 'PIT', name: 'Pittsburgh Penguins', division: 'Metropolitan', conference: 'Eastern' },
  { abbrev: 'SEA', name: 'Seattle Kraken', division: 'Pacific', conference: 'Western' },
  { abbrev: 'SJS', name: 'San Jose Sharks', division: 'Pacific', conference: 'Western' },
  { abbrev: 'STL', name: 'St. Louis Blues', division: 'Central', conference: 'Western' },
  { abbrev: 'TBL', name: 'Tampa Bay Lightning', division: 'Atlantic', conference: 'Eastern' },
  { abbrev: 'TOR', name: 'Toronto Maple Leafs', division: 'Atlantic', conference: 'Eastern' },
  { abbrev: 'UTA', name: 'Utah Hockey Club', division: 'Central', conference: 'Western' },
  { abbrev: 'VAN', name: 'Vancouver Canucks', division: 'Pacific', conference: 'Western' },
  { abbrev: 'VGK', name: 'Vegas Golden Knights', division: 'Pacific', conference: 'Western' },
  { abbrev: 'WSH', name: 'Washington Capitals', division: 'Metropolitan', conference: 'Eastern' },
  { abbrev: 'WPG', name: 'Winnipeg Jets', division: 'Central', conference: 'Western' },
] as const

export type TeamAbbrev = typeof NHL_TEAMS[number]['abbrev']

export const SEASONS = [20252026, 20242025, 20232024, 20222023, 20212022] as const
export type SeasonId = typeof SEASONS[number]

export interface PlayoffTeam {
  id: number
  abbrev: string
  name: LocalizedString
  commonName: LocalizedString
  logo: string
  darkLogo: string
}

export interface PlayoffSeries {
  seriesTitle: string
  seriesLetter: string
  playoffRound: number
  topSeedRank: number
  topSeedRankAbbrev: string
  topSeedWins: number
  bottomSeedRank: number
  bottomSeedRankAbbrev: string
  bottomSeedWins: number
  winningTeamId?: number
  losingTeamId?: number
  topSeedTeam: PlayoffTeam
  bottomSeedTeam: PlayoffTeam
}

export interface PlayoffBracket {
  series: PlayoffSeries[]
}

export function groupSeasonsByDecade(seasons: number[]): { decade: string; seasons: number[] }[] {
  const groups = new Map<string, number[]>()
  for (const s of seasons) {
    const year = Math.floor(s / 10000)
    const decade = `${Math.floor(year / 10) * 10}s`
    if (!groups.has(decade)) groups.set(decade, [])
    groups.get(decade)!.push(s)
  }
  return Array.from(groups.entries()).map(([decade, ss]) => ({ decade, seasons: ss }))
}

export function formatSeason(seasonId: number): string {
  const s = seasonId.toString()
  return `${s.slice(0, 4)}-${s.slice(6)}`
}

export function formatTOI(secondsPerGame: number): string {
  const mins = Math.floor(secondsPerGame / 60)
  const secs = Math.round(secondsPerGame % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}
