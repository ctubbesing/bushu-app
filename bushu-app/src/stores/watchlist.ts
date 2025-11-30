import api from '@/api'
import { ShowInfo, ShowSeason } from '@/types/watchlistTypes'
import tools from '@/utils/tools'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useWatchlist = defineStore('watchlist', () => {
  const isLoading = ref(false)
  // const isUpdatingSeason = ref(false)
  const catalog = ref<ShowInfo[]>([])

  const loadCatalog = async () => {
    isLoading.value = true
    try {
      catalog.value = await api.getWatchlistCatalog()
    } finally {
      isLoading.value = false
    }
  }

  const getShowInfoById = (showId: string): ShowInfo | undefined => catalog.value.find(show => show.id === showId)

  const getShowImageLink = (show: ShowInfo): string => {
    if (show.imgLink) {
      return show.imgLink
    }
    const seasons = tools.deepClone(show.seasons)
    return seasons.reverse().find((s: ShowSeason) => s.imgLink)?.imgLink ?? ''
  }

  const getImageLink = (showId: string, seasonId: string | null = null): string => {
    const show = getShowInfoById(showId)
    if (show) {
      const season: ShowSeason | undefined = show.seasons.find(season => season.id === seasonId)
      return season?.imgLink ?? getShowImageLink(show)
    }
    return ''
  }

  //////// TODO: rewrite these 2 methods once they're needed
  // async updateCatalog(newCatalogData: ShowInfo[]) {
  //   this.isLoading = true

  //   await watchlistService.SaveCatalog(newCatalogData)
  //   this.catalog = newCatalogData
    
  //   this.isLoading = false
  // },
  // async updateCatalogShowSeason(newSeasonData: ShowSeason) {
  //   this.isUpdatingSeason = true
    
  //   await watchlistService.UpdateShowSeason(newSeasonData)
  //   const showIdx: number = this.catalog.findIndex((s: ShowInfo) => s.id === newSeasonData.showId)
  //   if (showIdx !== -1) {
  //     const sznIdx: number = this.catalog[showIdx].seasons.findIndex((s: ShowSeason) => s.id === newSeasonData.id)
  //     if (sznIdx !== -1) {
  //       this.catalog[showIdx].seasons[sznIdx] = newSeasonData
  //     }
  //   }
    
  //   this.isUpdatingSeason = false
  // },

  return {
    isLoading,
    loadCatalog,
    getShowInfoById,
    getShowImageLink,
    getImageLink,
  }
})
