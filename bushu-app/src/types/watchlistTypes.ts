export interface ShowInfo {
  id: string
  title: string
  altTitle?: string
  isAnime?: boolean
  doEpisodeCountOverall?: boolean
  seasonCount?: number
  seasons: ShowSeason[]
  imgLink?: string
}

export interface ShowSeason {
  id: string
  showId: string
  seasonNumber: number
  name?: string
  totalEpisodeCount?: number | null
  startDate?: string
  endDate?: string
  airingSeason?: string
  airingYear?: number
  infoLink?: string
  imgLink?: string
}

export interface SeasonView {
  id: string
  seasonInfo: ShowSeason
  watchedEpisodes: number
  currentEpisodeCount?: number
  // isCompleted: boolean
  beganDate?: string
  completedDate?: string
  isDropped: boolean
  // notes: string[]
}

export interface WatchlistData {
  main: SeasonView[]
  live: SeasonView[]
  queue: SeasonView[]
  upcoming: ShowSeason[]
  backlog: ShowInfo[]
}