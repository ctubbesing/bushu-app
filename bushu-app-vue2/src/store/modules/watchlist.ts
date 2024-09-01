/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ShowInfo, ShowSeason } from '@/types/watchlistTypes'
import watchlistService from '@/utils/services/WatchlistService'
import tools from '@/utils/tools'

export default {
  state: {
    isLoading: false as boolean,
    isUpdatingSeason: false as boolean,
    catalog: [] as ShowInfo[],
  },
  getters: {
    getShowInfoById: (state: any) => (showId: string): ShowInfo | undefined => {
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
    getImageLink: (state: any, getters: any) => (showId: string, seasonId: string | null = null): string => {
      const show: ShowInfo | undefined = getters.getShowInfoById(showId)
      if (show) {
        const season: ShowSeason | undefined = show.seasons.find((season: ShowSeason) => season.id === seasonId)
        if (season && season.imgLink) {
          return season.imgLink
        }
        return getters.getShowImageLink(show)
      }
      return ''
    },
  },
  mutations: {
    setIsLoading(state: any, isLoading: boolean) {
      state.isLoading = isLoading
    },
    setIsUpdatingSeason(state: any, isUpdatingSeason: boolean) {
      state.isUpdatingSeason = isUpdatingSeason
    },
    setCatalog(state: any, catalog: ShowInfo[]) {
      state.catalog = catalog
    },
    setCatalogShowSeason(state: any, season: ShowSeason) {
      const showIdx: number = state.catalog.findIndex((s: ShowInfo) => s.id === season.showId)
      if (showIdx !== -1) {
        const sznIdx: number = state.catalog[showIdx].seasons.findIndex((s: ShowSeason) => s.id === season.id)
        if (sznIdx !== -1) {
          state.catalog[showIdx].seasons[sznIdx] = season
        }
      }
    },
  },
  actions: {
    async updateCatalog(context: any, newCatalogData: ShowInfo[]) {
      context.commit('setIsLoading', true)

      await watchlistService.SaveCatalog(newCatalogData)
      context.commit('setCatalog', newCatalogData)
      
      context.commit('setIsLoading', false)
    },
    async updateCatalogShowSeason(context: any, newSeasonData: ShowSeason) {
      context.commit('setIsUpdatingSeason', true)
      
      await watchlistService.UpdateShowSeason(newSeasonData)
      context.commit('setCatalogShowSeason', newSeasonData)
      
      context.commit('setIsUpdatingSeason', false)
    },
    async loadCatalogFromDropbox(context: any) {
      context.commit('setIsLoading', true)

      const catalogData: ShowInfo[] = await watchlistService.GetCatalog()
      context.commit('setCatalog', catalogData)
  
      context.commit('setIsLoading', false)
    },
  },
}
