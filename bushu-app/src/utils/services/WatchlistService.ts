import {
  ShowInfo,
  ShowSeason,
} from '@/types/watchlistTypes'
import dropbox from '@/utils/dropbox'

const showInfoPath = '/Watchlist/shows.json'
const showSeasonPath = '/Watchlist/seasons.json'

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

export default {
  async GetCatalog(): Promise<ShowInfo[]> {
    const showInfoData: DataStore<RawShowInfo> = await dropbox.getData(showInfoPath)
    const showSeasonData: DataStore<ShowSeason> = await dropbox.getData(showSeasonPath)

    let catalog: ShowInfo[] = []
    if (showInfoData !== null && showSeasonData !== null) {
      catalog = Object.values(showInfoData).map((rawInfo: RawShowInfo) => {
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
    }

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
    await dropbox.saveData(showSeasonPath, showSeasonData)
  },
}
