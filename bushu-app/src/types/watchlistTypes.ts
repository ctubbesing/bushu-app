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
  seasonNumber?: number
  name?: string
  totalEpisodeCount?: number | null
  startDate?: string
  endDate?: string
  airingSeason?: string
  airingYear?: number
  infoLink?: string
  imgLink?: string
}
