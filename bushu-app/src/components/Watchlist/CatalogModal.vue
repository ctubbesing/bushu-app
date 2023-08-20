<template>
  <div>
    <b-modal
      v-bind="$attrs"
      title="Catalog"
      centered
      scrollable
    >
      <!-- hide-footer -->
      <template v-slot:modal-footer="{ ok }">
        <div style="width: 100%; display: flex; justify-content: space-between">
            <!-- size="sm" -->
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
            size="sm"
            variant="outline-success"
            @click="ok()"
          >
            Close
          </b-button>
        </div>
      </template>
      <div v-if="!catalog || catalog.length === 0">
        There are no items in the catalog.
      </div>
      <div
        class="show-entry"
        v-for="(show, idx) in catalog"
        :key="idx"
      >
        <div
          class="show-info"
          @click="toggleShow(show.id)"
        >
          <div class="show-details">
            <div>
              <h4>{{ show.name }}</h4>
              <div
                v-if="show.altName"
                class="alt-name"
              >
                {{ show.altName }}
              </div>
            </div>
            <div>
              {{ show.seasonCount ? (tools.pluralFormat(show.seasonCount, 'season') + ', ') : '' }}{{ getTotalEpisodeCount(show) }} total episodes
            </div>
          </div>
          <div class="show-icons">
            <div style="font-size: 1.75em; font-weight: bold; text-align: center">
              {{ show.isAnime ? 'ア' : 'L' }}
            </div>
            <div @click.stop="editShowEntry(idx)">
              <hover-icon
                icon="pencil"
                scale="1.75"
                variant="secondary"
              />
            </div>
            <hover-icon
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
              class="show-info show-season"
              v-for="(season, sznIdx) in show.seasons"
              :key="idx + '-' + sznIdx"
            >
              <div class="season-details">
                <div>
                  <h5>
                    {{ `Season ${season.seasonNumber}` + (season.name ? `: ${season.name}` : '') }}
                  </h5>
                </div>
                <div v-if="season.totalEpisodeCount">
                  {{  tools.pluralFormat(season.totalEpisodeCount, 'episode') }}
                </div>
                <div>
                  <span v-if="season.startDate || season.endDate">
                    Aired {{ formatDate(season.startDate) }} - {{ formatDate(season.endDate) }}
                  </span>
                  <span v-if="season.airingSeason">
                    <b>{{ season.airingSeason }}</b>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </b-collapse>
      </div>
    </b-modal>
      <!-- v-if="editingShowIdx != -1" -->
    <show-info-edit-modal
      id="editModal"
      v-model="editingShowInfo"
      :isNewShow="editingShowId === ''"
      @save-changes="saveShowEntry"
    />
      <!-- :originalShowId="" -->
      <!-- @cancel="" -->
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { ShowInfo, ShowSeason } from '@/types/watchlistTypes'
import dropbox from '@/utils/dropbox';
import tools from '@/utils/tools';
import HoverIcon from '@/components/utils/HoverIcon.vue';
import ShowInfoEditModal from '@/components/Watchlist/ShowInfoEditModal.vue';

export default Vue.extend({
  name: 'CatalogModal',
  components: {
    showInfoEditModal: ShowInfoEditModal,
    hoverIcon: HoverIcon,
  },
  data() {
    return {
      catalog: [] as ShowInfo[],
      expandedShowId: '' as string,
      editingShowInfo: {} as ShowInfo,
      editingShowId: '' as string,
      tools,
    };
  },
  created() {
    this.catalog = this.$store.state.watchlist.catalog

    this.$root.$on('bv::collapse::state', (showId: string, isShown: boolean) => {
      if (isShown) {
        this.expandedShowId = showId
      } else if (this.expandedShowId === showId) {
        this.expandedShowId = '';
      }
    })
  },
  methods: {
    async testLoadData() {
      let result = await dropbox.getData('/Watchlist/fakeData.json')
      console.log('result:')
      console.log(result)
    },
    toggleShow(showId: string) {
      this.$root.$emit('bv::toggle::collapse', showId)
    },
    getTotalEpisodeCount(show: ShowInfo): number {
      return show.seasons.reduce((sum: number, s: ShowSeason) => {
        return sum + (s.totalEpisodeCount ? s.totalEpisodeCount : 0)
      }, 0)
    },
    formatDate(dateStr: string | null): string {
      if (dateStr === null) {
        return '?'
      }
      return dateStr
    },
    createNewEntry() {
      this.editingShowId = ''
      this.editingShowInfo = {
        id: '',
        name: '',
        seasons: [],
      }
      this.openEditModal()
    },
    editShowEntry(idx: number) {
      this.editingShowInfo = tools.deepClone(this.catalog[idx])
      this.editingShowId = this.editingShowInfo.id
      this.openEditModal()
    },
    // saveShowEntry(originalShowId: string) {
    saveShowEntry() {
      let updatedShowIdx = this.catalog.findIndex((s: ShowInfo) => s.id === this.editingShowId)
      if (updatedShowIdx === -1) {
        // add data as new entry
        this.catalog.push(this.editingShowInfo)
      } else {
        // update existing entry
        this.catalog[updatedShowIdx] = this.editingShowInfo
      }
    },
    openEditModal() {
      this.$bvModal.show('editModal')
    },
    closeEditModal() {
      this.$bvModal.hide('editModal')
    },
  },
});
</script>

<style>
.show-info {
  display: flex;
  justify-content: space-between;
  min-height: 100px;
  padding: 5px;
  margin: 3px;
  background-color: hsl(192, 71%, 85%);
  border-radius: 5px;
  cursor: pointer;
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
.show-icons {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
}
.show-icons > div:first-child {
  margin-top: -7px;
  margin-bottom: -7px;
}
.show-info h4 {
  margin-bottom: 4px;
}
.alt-name {
  font-size: 0.8em;
}
.seasons-section {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}
</style>