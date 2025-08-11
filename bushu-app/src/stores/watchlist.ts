import type {
  ShowInfo,
  ShowSeason
} from '@/types/watchlistTypes'
import WatchlistService from '@/utils/services/WatchlistService'
import tools from '@/utils/tools'
import { defineStore } from 'pinia'

export interface State {
  isLoading: boolean
  isUpdatingSeason: boolean
  catalog: ShowInfo[]
}

export const useWatchlist = defineStore('watchlist', {
  state: (): State => ({
    isLoading: false ,
    isUpdatingSeason: false ,
    catalog: [] ,
  }),
  getters: {
    getShowInfoById: (state: State) => (showId: string): ShowInfo | undefined => {
      return state.catalog.find((show: ShowInfo) => show.id === showId)
    },
    getShowImageLink: () => (show: ShowInfo): string => {
      if (show.imgLink) {
        return show.imgLink
      }
      const seasons: ShowSeason[] = tools.deepClone(show.seasons)
      const latestSznImgLinkIdx = seasons.reverse().findIndex((s: ShowSeason) => s.imgLink)
      return latestSznImgLinkIdx === -1 ? '' : seasons[latestSznImgLinkIdx].imgLink!
    },
    getImageLink: (state: State) => (showId: string, seasonId: string | null = null): string => {
      return ''
      /////////// TODO: rewrite these stores in normal Vue 3 pinia store syntax bc the older stuff isn't doing great
      // const show: ShowInfo | undefined = getters.getShowInfoById(showId)
      // if (show) {
      //   const season: ShowSeason | undefined = show.seasons.find((season: ShowSeason) => season.id === seasonId)
      //   if (season && season.imgLink) {
      //     return season.imgLink
      //   }
      //   return getters.getShowImageLink(show)
      // }
      // return ''
    },
  },
  actions: {
    async updateCatalog(newCatalogData: ShowInfo[]) {
      this.isLoading = true

      await WatchlistService.SaveCatalog(newCatalogData)
      this.catalog = newCatalogData
      
      this.isLoading = false
    },
    async updateCatalogShowSeason(newSeasonData: ShowSeason) {
      this.isUpdatingSeason = true
      
      await WatchlistService.UpdateShowSeason(newSeasonData)
      const showIdx: number = this.catalog.findIndex((s: ShowInfo) => s.id === newSeasonData.showId)
      if (showIdx !== -1) {
        const sznIdx: number = this.catalog[showIdx].seasons.findIndex((s: ShowSeason) => s.id === newSeasonData.id)
        if (sznIdx !== -1) {
          this.catalog[showIdx].seasons[sznIdx] = newSeasonData
        }
      }
      
      this.isUpdatingSeason = false
    },
    async loadCatalogFromDropbox() {
      this.isLoading = true
      
      const catalogData: ShowInfo[] = await WatchlistService.GetCatalog()
      this.catalog = catalogData
      
      this.isLoading = false
    },
  }
})
