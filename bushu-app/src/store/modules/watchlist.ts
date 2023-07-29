import { ShowInfo, ShowSeason } from '@/types/watchlistTypes'

export default {
  state: {
    catalog: [] as ShowInfo[],
  },
  mutations: {
    setCatalog(state: any, catalog: ShowInfo[]) {
      state.catalog = catalog
    },
  },
  actions: {
    updateCatalog(context: any, catalog: ShowInfo[]) {
      context.commit('setCatalog', catalog)
    },
  },
}
