import {
  ShowInfo,
  ShowSeason,
  WatchlistData,
  SeasonView,
} from '@/types/watchlistTypes'
import dropbox from '@/utils/dropbox'

interface DataStore<T> {
  [ id: string ]: T
}

interface RawShowInfo {
  id: string
  title: string
  altTitle?: string
  isAnime?: boolean
  doEpisodeCountOverall?: boolean
  seasonCount?: number
  showSeasonIds: string[]
  imgLink?: string
}
interface RawWatchlistData {
  mainSeasonViewIds: string[]
  liveSeasonViewIds: string[]
  queueSeasonViewIds: string[]
  upcomingShowSeasonIds: string[]
  backlogShowInfoIds: string[]
}
interface RawSeasonView {
  id: string
  showSeasonId: string
  watchedEpisodes: number
  currentEpisodeCount?: number
}

const showInfoPath = '/Watchlist/shows.json'
const showSeasonsPath = '/Watchlist/seasons.json'
const watchlistDataPath = '/Watchlist/watchlistData.json'
const seasonViewsPath = '/Watchlist/seasonViews.json'

let ShowInfoCache: DataStore<RawShowInfo> = {}
let ShowSeasonCache: DataStore<ShowSeason> = {}

async function LoadShowInfo(): Promise<DataStore<RawShowInfo>> {
  if (Object.keys(ShowInfoCache).length === 0) {
    let showInfo: DataStore<RawShowInfo> | null = await dropbox.getData(showInfoPath)
    if (showInfo === null) {
      showInfo = {}
    }
    ShowInfoCache = showInfo
  }
  return ShowInfoCache
}

async function LoadShowSeasons(): Promise<DataStore<ShowSeason>> {
  if (Object.keys(ShowSeasonCache).length === 0) {
    let showSeasons: DataStore<ShowSeason> | null = await dropbox.getData(showSeasonsPath)
    if (showSeasons === null) {
      showSeasons = {}
    }
    ShowSeasonCache = showSeasons
  }
  return ShowSeasonCache
}

async function LoadWatchlistData(): Promise<RawWatchlistData> {
  let watchlistData: RawWatchlistData | null = await dropbox.getData(watchlistDataPath)
  if (watchlistData === null) {
    watchlistData = {
      mainSeasonViewIds: [],
      liveSeasonViewIds: [],
      queueSeasonViewIds: [],
      upcomingShowSeasonIds: [],
      backlogShowInfoIds: [],
    }
  }
  return watchlistData
}

async function LoadSeasonViews(): Promise<DataStore<RawSeasonView>> {
  let seasonViews: DataStore<RawSeasonView> | null = await dropbox.getData(seasonViewsPath)
  if (seasonViews === null) {
    seasonViews = {}
  }
  return seasonViews
}

async function BuildShowInfo(ids: string[]): Promise<DataStore<ShowInfo>> {
  const uniqueIds = [ ...new Set(ids) ]
  const rawShowInfo: DataStore<RawShowInfo> = await LoadShowInfo()
  const showSeasons: DataStore<ShowSeason> = await LoadShowSeasons()
  const showInfo: DataStore<ShowInfo> = {}

  uniqueIds.forEach((id: string) => {
    const rawInfo = rawShowInfo[id]
    showInfo[id] = {
      id: id,
      title: rawInfo.title,
      altTitle: rawInfo.altTitle,
      isAnime: rawInfo.isAnime,
      doEpisodeCountOverall: rawInfo.doEpisodeCountOverall,
      seasonCount: rawInfo.seasonCount,
      seasons: rawInfo.showSeasonIds.map((id) => showSeasons[id]),
      imgLink: rawInfo.imgLink,
    }
  })

  return showInfo
}

async function BuildSeasonViews(ids: string[]): Promise<DataStore<SeasonView>> {
  const uniqueIds = [ ...new Set(ids) ]
  const rawViews: DataStore<RawSeasonView> = await LoadSeasonViews()
  const showSeasons: DataStore<ShowSeason> = await LoadShowSeasons()
  const seasonViews: DataStore<SeasonView> = {}

  uniqueIds.forEach((id: string) => {
    const rawView = rawViews[id]
    seasonViews[id] = {
      id: id,
      seasonInfo: showSeasons[rawView.showSeasonId],
      watchedEpisodes: rawView.watchedEpisodes,
      currentEpisodeCount: rawView.currentEpisodeCount,
    }
  })

  return seasonViews
}

export default {
  async GetCatalog(): Promise<ShowInfo[]> {
    const showInfoData: DataStore<RawShowInfo> = await LoadShowInfo()
    const showSeasonData: DataStore<ShowSeason> = await LoadShowSeasons()

    const catalog: ShowInfo[] = Object.values(showInfoData).map((rawInfo: RawShowInfo) => {
      return {
        id: rawInfo.id,
        title: rawInfo.title,
        altTitle: rawInfo.altTitle,
        isAnime: rawInfo.isAnime,
        doEpisodeCountOverall: rawInfo.doEpisodeCountOverall,
        seasonCount: rawInfo.seasonCount,
        seasons: rawInfo.showSeasonIds.map((id: string) => showSeasonData[id]),
        imgLink: rawInfo.imgLink,
      }
    })
    catalog.sort((a, b) => a.title.localeCompare(b.title))

    return catalog
  },
  async SaveCatalog(catalog: ShowInfo[]) {
    const showInfoData: DataStore<RawShowInfo> = {}
    const showSeasonData: DataStore<ShowSeason> = {}

    catalog.forEach((show: ShowInfo) => {
      show.seasons.forEach((season: ShowSeason) => {
        showSeasonData[season.id] = season
      })

      const rawShow: RawShowInfo = {
        id: show.id,
        title: show.title,
        altTitle: show.altTitle,
        isAnime: show.isAnime,
        doEpisodeCountOverall: show.doEpisodeCountOverall,
        seasonCount: show.seasonCount,
        imgLink: show.imgLink,
        showSeasonIds: show.seasons.map((season: ShowSeason) => season.id)
      }
      showInfoData[show.id] = rawShow
    })

    await dropbox.saveData(showInfoPath, showInfoData)
    await dropbox.saveData(showSeasonsPath, showSeasonData)
    ShowInfoCache = showInfoData
    ShowSeasonCache = showSeasonData
  },
  async GetWatchlistData(): Promise<WatchlistData> {
    const rawWLData = await LoadWatchlistData()
    const allSeasonViewIds = [
      ...rawWLData.mainSeasonViewIds,
      ...rawWLData.liveSeasonViewIds,
      ...rawWLData.queueSeasonViewIds,
    ]
    const allSeasonViews: DataStore<SeasonView> = await BuildSeasonViews(allSeasonViewIds)
    const allShowInfo: DataStore<ShowInfo> = await BuildShowInfo(rawWLData.backlogShowInfoIds)
    const allShowSeasons: DataStore<ShowSeason> = await LoadShowSeasons()

    const watchlist: WatchlistData = {
      main: rawWLData.mainSeasonViewIds.map((id) => allSeasonViews[id]),
      live: rawWLData.liveSeasonViewIds.map((id) => allSeasonViews[id]),
      queue: rawWLData.queueSeasonViewIds.map((id) => allSeasonViews[id]),
      upcoming: rawWLData.upcomingShowSeasonIds.map((id) => allShowSeasons[id]),
      backlog: rawWLData.backlogShowInfoIds.map((id) => allShowInfo[id]),
    }

    return watchlist
  },
}
