import { DateTime } from "luxon"

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
  irregularDates?: RawEpisodeDate[]
  startDate?: string
  endDate?: string
  airingSeason?: string
  airingYear?: number
  infoLink?: string
  imgLink?: string
}

export interface RawEpisodeDate {
  episode: number
  date: string
}

export interface EpisodeDate {
  episode: number
  date: DateTime
}

export interface SeasonView {
  id: string
  seasonInfo: ShowSeason
  watchedEpisodes: number
  currentEpisodeCount?: number
  beganDate?: string
  completedDate?: string
  droppedDate?: string
  // notes: string[]
}

export interface WatchlistData {
  main: SeasonView[]
  live: SeasonView[]
  queue: SeasonView[]
  upcoming: ShowSeason[]
  backlog: ShowInfo[]
}