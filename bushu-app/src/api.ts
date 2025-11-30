import type { ShowInfo } from './types/watchlistTypes'
import watchlistService from './utils/services/watchlistService'

export default {
  async getWatchlistCatalog(): Promise<ShowInfo[]> {
    return await watchlistService.GetCatalog()
  },
}
