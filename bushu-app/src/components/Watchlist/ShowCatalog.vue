<template>
  <div>
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
          <hover-icon
            icon="pencil"
            scale="1.75"
            variant="secondary"
          />
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
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { ShowInfo, ShowSeason } from '@/types/watchlistTypes'
import dropbox from '@/utils/dropbox';
import tools from '@/utils/tools';
import HoverIcon from '@/components/utils/HoverIcon.vue';

export default Vue.extend({
  name: 'ShowCatalog',
  components: {
    hoverIcon: HoverIcon,
  },
  data() {
    return {
      catalog: [] as ShowInfo[],
      expandedShowId: '' as string,
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