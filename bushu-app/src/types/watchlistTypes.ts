export interface ShowInfo {
  id: string
  name: string
  altName?: string
  isAnime?: boolean
  doEpisodeCountOverall?: boolean
  seasonCount?: number
  seasons: ShowSeason[]
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
  imgPath?: string
}
