import { ShowInfo, ShowSeason } from '@/types/watchlistTypes'
import watchlistService from '@/utils/services/WatchlistService'
import tools from '@/utils/tools'

export default {
  state: {
    isLoading: false as boolean,
    catalog: [] as ShowInfo[],
  },
  getters: {
    getShowInfoById: (state: any) => (showId: string): ShowInfo | undefined => {
      return state.catalog.find((show: ShowInfo) => show.id === showId)
    },
    getShowImageLink: (state: any) => (show: ShowInfo): string => {
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
    setCatalog(state: any, catalog: ShowInfo[]) {
      state.catalog = catalog
    },
  },
  actions: {
    async updateCatalog(context: any, newCatalogData: ShowInfo[]) {
      context.commit('setIsLoading', true)

      await watchlistService.SaveCatalog(newCatalogData)
      context.commit('setCatalog', newCatalogData)
      
      context.commit('setIsLoading', false)
    },
    async loadCatalogFromDropbox(context: any) {
      context.commit('setIsLoading', true)

      const catalogData: ShowInfo[] = await watchlistService.GetCatalog()
      context.commit('setCatalog', catalogData)

      context.commit('setIsLoading', false)
    },
  },
}
