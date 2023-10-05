import { ShowInfo } from '@/types/watchlistTypes'
import watchlistService from '@/utils/services/WatchlistService'

export default {
  state: {
    isLoading: false as boolean,
    catalog: [] as ShowInfo[],
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
