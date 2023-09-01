import { ShowInfo, ShowSeason } from '@/types/watchlistTypes'
import dropbox from '@/utils/dropbox'

const catalogPath = '/Watchlist/catalog.json'

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

      await dropbox.saveData(catalogPath, newCatalogData)
      context.commit('setCatalog', newCatalogData)
      
      context.commit('setIsLoading', false)
    },
    async loadCatalogFromDropbox(context: any) {
      context.commit('setIsLoading', true)

      let catalogData: null | ShowInfo[] = await dropbox.getData(catalogPath)
      if (catalogData === null) {
        catalogData = []
      }
      context.commit('setCatalog', catalogData)

      context.commit('setIsLoading', false)
    },
  },
}
