<template>
  <div>
    <b-modal
      v-bind="$attrs"
      :title="selectMode ? ('Select a ' + selectMode + ':') : 'Catalog'"
      centered
      scrollable
      @hidden="onModalClose()"
    >
      <template v-slot:modal-footer="{ ok }">
        <div style="width: 100%; display: flex; justify-content: space-between">
          <b-button
            variant="secondary"
            @click="createNewEntry()"
            style="padding: 6px; border: none; line-height: 20px"
          >
            <b-icon
              icon="plus"
              variant="light"
              font-scale="1.5"
            />
          </b-button>
          <b-button
            v-if="selectionTargetList"
            size="sm"
            variant="outline-primary"
            :disabled="!selectedItemId"
            @click="chooseItem()"
          >
            Select {{ selectMode | toTitleCase }}
          </b-button>
          <b-button
            size="sm"
            variant="outline-success"
            @click="ok()"
          >
            {{ selectionTargetList ? 'Cancel' : 'Close' }}
          </b-button>
        </div>
      </template>
      <div id="catalog-search">
        <b-form-input
          v-model="searchString"
          @update="searchTMDB"
          type="search"
          debounce="350"
          placeholder="Search"
        />
      </div>
      <div v-if="!catalog || catalog.length === 0">
        There are no items in the catalog.
      </div>
      <div
        class="show-entry"
        v-for="(show, idx) in filteredCatalog"
        :key="idx"
      >
        <div
          :class="[
            'show-info',
            { 'selected-item': show.id === selectedItemId }
          ]"
          @click="selectShow(show.id)"
        >
          <div style="display: flex; width: 100%">
            <thumbnail-image
              :link="getShowImageLink(show)"
              :colorSeed="show.id"
              :height="90"
              style="margin-right: 10px"
            />
            <div class="show-details">
              <div>
                <h4>{{ show.title }}</h4>
                <div
                  v-if="show.altTitle"
                  class="alt-title"
                >
                  {{ show.altTitle }}
                </div>
              </div>
              <div v-if="show.seasonCount">
                {{  tools.pluralFormat(show.seasonCount, 'season') }}
              </div>
              <div v-else>
                {{ getTotalEpisodeCount(show) }} total episodes
              </div>
            </div>
          </div>
          <div class="show-icons">
            <div style="font-size: 1.5em; font-weight: bold; text-align: center">
              {{ show.isAnime ? 'ア' : '&nbsp;' }}
            </div>
            <div @click.stop="editShowEntry(idx)">
              <hover-icon
                icon="pencil"
                scale="1.75"
                variant="secondary"
              />
            </div>
            <hover-icon
              v-if="selectMode !== 'show'"
              :icon="'caret-right' + ((expandedShowId === show.id) ? '-fill' : '')"
              scale="1.75"
              variant="secondary"
              :style="'transition: transform 0.2s;' + ((expandedShowId === show.id) ? 'transform: rotate(90deg)' : '')"
            />
          </div>
        </div>
        <b-collapse
          :id="show.id"
          accordion="show-accordion"
        >
          <div class="seasons-section">
            <div
              v-for="(season, sznIdx) in show.seasons"
              :key="idx + '-' + sznIdx"
              :class="[
                'show-info',
                'show-season',
                { 'selected-item': season.id === selectedItemId }
              ]"
              @click="selectSeason(season.id)"
            >
              <div style="display: flex; width: 100%">
                <thumbnail-image
                  v-if="show.seasons.some(s => s.imgLink)"
                  :link="getSeasonImageLink(show, sznIdx)"
                  :doFaded="!season.imgLink"
                  :colorSeed="season.id"
                  :height="80"
                  style="margin-right: 10px"
                />
                <div class="season-details">
                  <h5>
                    {{ `Season ${season.seasonNumber}` + (season.name ? `: ${season.name}` : '') }}
                  </h5>
                  <div style="display: flex; justify-content: space-between; align-items: flex-end">
                    <div>
                      <div v-if="season.totalEpisodeCount">
                        {{  tools.pluralFormat(season.totalEpisodeCount, 'episode') }}
                      </div>
                      <div v-if="season.startDate || season.endDate">
                        Aired {{ season.startDate | formatDate }}
                        <span v-if="season.startDate !== season.endDate">
                          - {{ season.endDate | formatDate }}
                        </span>
                      </div>
                    </div>
                    <div
                      v-if="season.airingYear && season.airingSeason"
                    >
                      <b>{{ season.airingYear + ' ' + season.airingSeason }}</b>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </b-collapse>
      </div>
      <div
        v-if="tmdbShowResults.length > 0"
        id="tmdb-results"
      >
        <h3>
          Add from
          <div style="display: inline-flex">
            <img
              src="https://www.themoviedb.org/assets/2/v4/logos/v2/blue_short-8e7b30f73a4020692ccca9c88bafe5dcb6f8a62a4c6bc55cd9ba82bb2cd95f6c.svg"
              style="height: 24px"
            >
          </div>
        </h3>
        <div style="margin: -8px 0 8px; font-size: 7.75px; color: #666">
          BushuApp uses TMDB and the TMDB APIs but is not endorsed, certified, or otherwise approved by TMDB.
        </div>
        <div
          v-for="show in tmdbShowResults"
          :key="show.id"
          class="tmdb-show"
        >
          <thumbnail-image
            :link="show.imgLink"
            :height="75"
            :colorSeed="'0d253f'"
          />
          <div class="tmdb-show-text">
            <div>{{ show.title }}</div>
            <div v-if="show.altTitle">
              {{ show.altTitle }}
            </div>
          </div>
        </div>
      </div>
    </b-modal>
    <show-info-edit-modal
      id="editModal"
      v-model="editingShowInfo"
      :isNewShow="editingShowId === ''"
      @save-changes="saveShowEntry"
    />
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { ShowInfo, ShowSeason } from '@/types/watchlistTypes'
import tools from '@/utils/tools'
import HoverIcon from '@/components/utils/HoverIcon.vue'
import ShowInfoEditModal from '@/components/Watchlist/ShowInfoEditModal.vue'
import ThumbnailImage from '@/components/utils/ThumbnailImage.vue'
import TMDBService from '@/utils/services/TMDBService'

export default Vue.extend({
  name: 'CatalogModal',
  components: {
    showInfoEditModal: ShowInfoEditModal,
    hoverIcon: HoverIcon,
    thumbnailImage: ThumbnailImage,
  },
  props: {
    selectionTargetList: {
      type: String,
      required: false,
    },
  },
  data() {
    return {
      catalog: [] as ShowInfo[],
      expandedShowId: '' as string,
      editingShowInfo: {} as ShowInfo,
      editingShowId: '' as string,
      selectedItemId: '' as string,
      searchString: '' as string,
      tmdbShowResults: [] as ShowInfo[],
      tools,
    };
  },
  computed: {
    isReady(): boolean {
      return !this.$store.state.watchlist.isLoading
    },
    selectMode(): string | null {
      if (this.selectionTargetList == undefined) {
        return null
      } else if (this.selectionTargetList === 'backlog') {
        return 'show'
      }
      return 'season'
    },
    filteredCatalog(): ShowInfo[] {
      if (this.searchString === '') {
        return this.catalog
      }
      return this.catalog.filter((s: ShowInfo) => {
        return s.title.toLowerCase().includes(this.searchString.toLowerCase())
      })
    },
  },
  watch: {
    isReady(isReady: boolean) {
      if (isReady) {
        this.loadData()
      }
    },
  },
  created() {
    this.loadData()

    this.$root.$on('bv::collapse::state', (showId: string, isShown: boolean) => {
      if (isShown) {
        this.expandedShowId = showId
      } else if (this.expandedShowId === showId) {
        this.expandedShowId = '';
      }
    })
  },
  methods: {
    loadData() {
      if (this.isReady) {
        this.catalog = this.$store.state.watchlist.catalog
      }
    },
    toggleShow(showId: string) {
      this.$root.$emit('bv::toggle::collapse', showId)
    },
    selectShow(showId: string) {
      if (this.selectMode === 'show') {
        this.selectedItemId = (this.selectedItemId === showId) ? '' : showId
      } else {
        this.toggleShow(showId)
      }
    },
    selectSeason(seasonId: string) {
      if (this.selectMode === 'season') {
        this.selectedItemId = (this.selectedItemId === seasonId) ? '' : seasonId
      }
    },
    chooseItem() {
      if (this.selectMode === 'show') {
        const selectedShow = this.catalog.find((show: ShowInfo) => show.id === this.selectedItemId)
        if (selectedShow) {
          this.$emit('item-selected', selectedShow, this.selectionTargetList)
        }
      } else if (this.selectMode === 'season') {
        for (let i = 0; i < this.catalog.length; i++) {
          let show = this.catalog[i]
          for (let j = 0; j < show.seasons.length; j++) {
            if (show.seasons[j].id === this.selectedItemId) {
              const selectedSeason = show.seasons[j]
              this.$emit('item-selected', selectedSeason, this.selectionTargetList)
              return
            }
          }
        }
      }
      
    },
    getTotalEpisodeCount(show: ShowInfo): number {
      return show.seasons.reduce((sum: number, s: ShowSeason) => {
        return sum + (s.totalEpisodeCount ? s.totalEpisodeCount : 0)
      }, 0)
    },
    getShowImageLink(show: ShowInfo): string {
      return this.$store.getters.getShowImageLink(show)
    },
    getSeasonImageLink(show: ShowInfo, sznIdx: number): string {
      if (show.seasons[sznIdx].imgLink) {
        return show.seasons[sznIdx].imgLink!
      }
      return this.getShowImageLink(show)
    },
    createNewEntry() {
      this.editingShowId = ''
      this.editingShowInfo = {
        id: tools.getGUID(),
        title: '',
        seasons: [],
      }
      this.openEditModal()
    },
    editShowEntry(idx: number) {
      this.editingShowInfo = tools.deepClone<ShowInfo>(this.filteredCatalog[idx])
      this.editingShowId = this.editingShowInfo.id
      this.openEditModal()
    },
    async saveShowEntry() {
      let updatedShowIdx = this.catalog.findIndex((s: ShowInfo) => s.id === this.editingShowId)
      if (updatedShowIdx === -1) {
        // add data as new entry
        this.catalog.push(this.editingShowInfo)
      } else {
        // update existing entry
        this.catalog[updatedShowIdx] = this.editingShowInfo
      }
      this.catalog.sort((a, b) => {
        const titleA = a.title.toLowerCase().split(/^the /).reverse()[0]
        const titleB = b.title.toLowerCase().split(/^the /).reverse()[0]
        return titleA.localeCompare(titleB)
      })
      await this.$store.dispatch('updateCatalog', this.catalog)
    },
    async searchTMDB(searchStr: string) {
      if (searchStr === '') {
        this.tmdbShowResults = []
      } else {
        this.tmdbShowResults = await TMDBService.searchTVShows(searchStr) 
      }
    },
    openEditModal() {
      this.$bvModal.show('editModal')
    },
    closeEditModal() {
      this.$bvModal.hide('editModal')
    },
    onModalClose() {
      this.selectedItemId = ''
      this.searchString = ''
      this.$emit('hidden')
    },
  },
});
</script>

<style scoped>
#catalog-search {
  margin-bottom: 10px;
}
.show-info {
  display: flex;
  justify-content: space-between;
  min-height: 100px;
  padding: 5px;
  margin: 3px;
  background-color: hsl(192, 71%, 85%);
  border-radius: 5px;
  cursor: pointer;
  box-shadow: inset 0 -2px 1px #0003;
}
.show-season {
  min-height: 80px;
  width: 90%;
  background-color: hsl(192, 71%, 65%);
  font-size: 0.8em;
}
.show-details {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
}
.season-details {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  width: 100%;
}
.show-icons {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.show-icons > div:first-child {
  margin-top: -4px;
  margin-bottom: -4px;
}
.show-info h4 {
  margin-bottom: 4px;
}
.alt-title {
  font-size: 0.8em;
}
.seasons-section {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}
.selected-item {
  background-color: #007bff;
  color: #fff;
  outline: 2px solid #007bff;
  outline-offset: 2px;
}
#tmdb-results {
  margin-top: 20px;
  padding-top: 10px;
  border-top: double 3px #888;
}
.tmdb-show {
  display: flex;
  padding: 5px;
  border-top: solid 1px #eee;
  cursor: pointer;
}
.tmdb-show:hover {
  background-color: hsl(192, 71%, 95%);
}
.tmdb-show:last-child {
  border-bottom: solid 1px #eee;
}
.tmdb-show > div.tmdb-show-text {
  padding-left: 10px;
}
.tmdb-show > div.tmdb-show-text > div:nth-child(2) {
  font-size: 0.8em;
  color: #ccc;
}
</style>