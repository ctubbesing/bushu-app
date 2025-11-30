import {
  type ShowInfo,
  ShowSeason,
  type WatchlistData,
  type SeasonView,
} from '@/types/watchlistTypes'
import dropbox from '@/translators/dropbox'
import tools from '../tools'
import z from 'zod'

interface DataStore<T> {
  [ id: string ]: T
}

const RawShowInfo = z.object({
  id: z.string(),
  title: z.string(),
  altTitle: z.string().optional(),
  isAnime: z.boolean().optional(),
  doEpisodeCountOverall: z.boolean().optional(),
  seasonCount: z.number().optional(),
  showSeasonIds: z.array(z.string()),
  imgLink: z.string().optional(),
})
type RawShowInfo = z.infer<typeof RawShowInfo>

const RawSeasonView = z.object({
  id: z.string(),
  showSeasonId: z.string(),
  watchedEpisodes: z.number(),
  currentEpisodeCount: z.number().optional(),
  beganDate: z.string().optional(),
  completedDate: z.string().optional(),
  droppedDate: z.string().optional(),
})
type RawSeasonView = z.infer<typeof RawSeasonView>

const RawWatchlistData = z.object({
  mainSeasonViewIds: z.array(z.string()),
  liveSeasonViewIds: z.array(z.string()),
  queueSeasonViewIds: z.array(z.string()),
  upcomingShowSeasonIds: z.array(z.string()),
  backlogShowInfoIds: z.array(z.string()),
})
type RawWatchlistData = z.infer<typeof RawWatchlistData>

const RawShowInfoRecord =  z.record(z.string(), RawShowInfo)
const ShowSeasonRecord =  z.record(z.string(), ShowSeason)
const RawSeasonViewRecord =  z.record(z.string(), RawSeasonView)

const showInfoPath = '/Watchlist/shows.json'
const showSeasonsPath = '/Watchlist/seasons.json'
const watchlistDataPath = '/Watchlist/watchlistData.json'
const seasonViewsPath = '/Watchlist/seasonViews.json'

let ShowInfoCache: DataStore<RawShowInfo> = {}
let ShowSeasonCache: DataStore<ShowSeason> = {}
let SeasonViewCache: DataStore<RawSeasonView> = {}

let DebouncedSeasonViewUpdates: DataStore<SeasonView> = {}
let DebounceTimeoutId: number | undefined = undefined

async function LoadShowInfo(doForceReload = false): Promise<DataStore<RawShowInfo>> {
  if (doForceReload || Object.keys(ShowInfoCache).length === 0) {
    let showInfo = RawShowInfoRecord.parse(await dropbox.getData(showInfoPath))
    if (showInfo === null) {
      showInfo = {}
    }
    ShowInfoCache = showInfo
  }
  return ShowInfoCache
}

async function LoadShowSeasons(doForceReload = false): Promise<DataStore<ShowSeason>> {
  if (doForceReload || Object.keys(ShowSeasonCache).length === 0) {
    let showSeasons: DataStore<ShowSeason> | null = ShowSeasonRecord.parse(await dropbox.getData(showSeasonsPath))
    if (showSeasons === null) {
      showSeasons = {}
    }
    ShowSeasonCache = showSeasons
  }
  return ShowSeasonCache
}

async function LoadSeasonViews(doForceReload = false): Promise<DataStore<RawSeasonView>> {
  if (doForceReload || Object.keys(SeasonViewCache).length === 0) {
    let seasonViews = RawSeasonViewRecord.parse(await dropbox.getData(seasonViewsPath))
    if (seasonViews === null) {
      seasonViews = {}
    }
    SeasonViewCache = seasonViews
  }
  return SeasonViewCache
}

async function LoadWatchlistData(): Promise<RawWatchlistData> {
  let watchlistData = RawWatchlistData.parse(await dropbox.getData(watchlistDataPath))
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

async function BuildShowInfo(ids: string[], doForceReload = false): Promise<DataStore<ShowInfo>> {
  const uniqueIds = [ ...new Set(ids) ]
  const rawShowInfo: DataStore<RawShowInfo> = await LoadShowInfo(doForceReload)
  const showSeasons: DataStore<ShowSeason> = await LoadShowSeasons(doForceReload)
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


async function BuildSeasonViews(ids: string[], doForceReload = false): Promise<DataStore<SeasonView>> {
  const uniqueIds = [ ...new Set(ids) ]
  const rawViews: DataStore<RawSeasonView> = await LoadSeasonViews(doForceReload)
  const showSeasons: DataStore<ShowSeason> = await LoadShowSeasons(doForceReload)
  const seasonViews: DataStore<SeasonView> = {}

  uniqueIds.forEach((id: string) => {
    const rawView = rawViews[id]
    seasonViews[id] = {
      id: id,
      seasonInfo: showSeasons[rawView.showSeasonId],
      watchedEpisodes: rawView.watchedEpisodes,
      currentEpisodeCount: rawView.currentEpisodeCount,
      beganDate: rawView.beganDate,
      completedDate: rawView.completedDate,
      droppedDate: rawView.droppedDate,
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
    catalog.sort((a, b) => {
      const titleA = a.title.toLowerCase().split(/^the /).reverse()[0]
      const titleB = b.title.toLowerCase().split(/^the /).reverse()[0]
      return titleA.localeCompare(titleB)
    })

    return catalog
  },
  async SaveCatalog(catalog: ShowInfo[]): Promise<void> {
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

    // await dropbox.saveData(showInfoPath, showInfoData)///////temporarily disabled
    // await dropbox.saveData(showSeasonsPath, showSeasonData)///////temporarily disabled
    ShowInfoCache = showInfoData
    ShowSeasonCache = showSeasonData
  },
  async UpdateShowSeason(season: ShowSeason): Promise<void> {
    const showSeasonData: DataStore<ShowSeason> = await LoadShowSeasons()

    showSeasonData[season.id] = season

    // await dropbox.saveData(showSeasonsPath, showSeasonData)///////temporarily disabled
    ShowSeasonCache = showSeasonData
  },
  async GetWatchlistData(doForceReload = false): Promise<WatchlistData> {
    const rawWLData: RawWatchlistData = await LoadWatchlistData()
    const allSeasonViewIds = [
      ...rawWLData.mainSeasonViewIds,
      ...rawWLData.liveSeasonViewIds,
      ...rawWLData.queueSeasonViewIds,
    ]
    const allSeasonViews: DataStore<SeasonView> = await BuildSeasonViews(allSeasonViewIds, doForceReload)
    const allShowInfo: DataStore<ShowInfo> = await BuildShowInfo(rawWLData.backlogShowInfoIds, doForceReload)
    const allShowSeasons: DataStore<ShowSeason> = await LoadShowSeasons(doForceReload)

    const watchlist: WatchlistData = {
      main: rawWLData.mainSeasonViewIds.map((id) => allSeasonViews[id]),
      live: rawWLData.liveSeasonViewIds.map((id) => allSeasonViews[id]),
      queue: rawWLData.queueSeasonViewIds.map((id) => allSeasonViews[id]),
      upcoming: rawWLData.upcomingShowSeasonIds.map((id) => allShowSeasons[id]),
      backlog: rawWLData.backlogShowInfoIds.map((id) => allShowInfo[id]),
    }

    return watchlist
  },
  async SaveWatchlistData(watchlist: WatchlistData): Promise<void> {
    const allSeasonViews: SeasonView[] = [
      ...watchlist.main,
      ...watchlist.live,
      ...watchlist.queue,
    ]
    await this.SaveSeasonViews(allSeasonViews)

    const rawData: RawWatchlistData = {
      mainSeasonViewIds: watchlist.main.map((view: SeasonView) => view.id),
      liveSeasonViewIds: watchlist.live.map((view: SeasonView) => view.id),
      queueSeasonViewIds: watchlist.queue.map((view: SeasonView) => view.id),
      upcomingShowSeasonIds: watchlist.upcoming.map((season: ShowSeason) => season.id),
      backlogShowInfoIds: watchlist.backlog.map((show: ShowInfo) => show.id),
    }

    // await dropbox.saveData(watchlistDataPath, rawData)///////temporarily disabled
  },
  async SaveSeasonViews(seasonViews: SeasonView[]): Promise<void> {
    const allViews: DataStore<RawSeasonView> = await LoadSeasonViews()
    const newViews: DataStore<RawSeasonView> = tools.deepClone(allViews)
    seasonViews.forEach((view: SeasonView) => {
      newViews[view.id] = {
        id: view.id,
        showSeasonId: view.seasonInfo.id,
        watchedEpisodes: view.watchedEpisodes,
        currentEpisodeCount: view.currentEpisodeCount,
        beganDate: view.beganDate,
        completedDate: view.completedDate,
        droppedDate: view.droppedDate,
      }
    })

    SeasonViewCache = newViews
    // await dropbox.saveData(seasonViewsPath, newViews)///////temporarily disabled
  },
  SaveSeasonViewDebounced(view: SeasonView): void {
    const debounceSeconds = 3
    DebouncedSeasonViewUpdates[view.id] = view
    window.clearTimeout(DebounceTimeoutId)
    DebounceTimeoutId = window.setTimeout(() => {
      const newSeasonViews: SeasonView[] = Object.values(DebouncedSeasonViewUpdates)
      this.SaveSeasonViews(newSeasonViews)
      DebouncedSeasonViewUpdates = {}
      DebounceTimeoutId = undefined
    }, debounceSeconds * 1000)
  },
  async ForceSaveSeasonViews(): Promise<void> {
    if (Object.keys(DebouncedSeasonViewUpdates).length > 0) {
      window.clearTimeout(DebounceTimeoutId)
      DebounceTimeoutId = undefined

      const newSeasonViews: SeasonView[] = Object.values(DebouncedSeasonViewUpdates)
      await this.SaveSeasonViews(newSeasonViews)

      DebouncedSeasonViewUpdates = {}
    }
  },
}
