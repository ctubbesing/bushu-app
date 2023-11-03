<template>
  <div id="full-item">
    <div id="item-details">
      <div id="info-section">
        <thumbnail-image
          :link="imageLink"
          :height="100"
          style="margin-right: 5px"
        />
        <div>
          <div id="item-name">
            <span>{{ loadedShowInfo.title }}</span>
            <template v-if="parentList !== 'backlog'">
              <span v-if="loadedShowSeason.name">
                {{ loadedShowSeason.name }}
              </span>
              <span v-else>
                Season {{ loadedShowSeason.seasonNumber }}
              </span>
            </template>
          </div>
          <div
            v-if="seasonViewData"
            id="viewed-dates"
          >
            <div v-if="seasonViewData.beganDate">
              Started {{ seasonViewData.beganDate | formatDate }}
            </div>
            <div v-if="seasonViewData.completedDate">
              Completed {{ seasonViewData.completedDate | formatDate }}
            </div>
          </div>
        </div>
      </div>
      <div
        v-if="seasonViewData"
        id="progress-section"
        :style="getProgressBar(seasonViewData)"
      >
        <div>
          <span @click="toggleEpisodeCountUnits">
            Progress:
          </span>
          <span>
            <span>{{ displayedWatchedEpisodeCount ? displayedWatchedEpisodeCount : '-' }}</span>
            <span> / {{ displayedTotalEpisodeCount ? displayedTotalEpisodeCount : '?' }}</span>
          </span>
          <span
            v-if="doEpisodeCountUnitsLabel"
            class="episode-count-units"
            :key="doEpisodeCountOverall"
          >
            ({{ doEpisodeCountOverall ? 'Overall' : 'This season' }})
          </span>
        </div>
        <b-button
          id="increment-button"
          variant="outline-secondary"
          pill
          @click="incrementProgress()"
        >
          <b-icon
            icon="plus"
            variant="light"
            font-scale="1"
          />
        </b-button>
      </div>
    </div>
    <div id="side-info"></div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import {
  SeasonView,
  ShowInfo,
  ShowSeason,
} from '@/types/watchlistTypes'
import ThumbnailImage from '@/components/utils/ThumbnailImage.vue'
import watchlistService from '@/utils/services/WatchlistService';

export default Vue.extend({
  name: 'WatchlistItem',
  components: {
    thumbnailImage: ThumbnailImage,
  },
  props: {
    parentList: {
      type: String,
      required: true,
    },
    seasonView: {
      type: Object as PropType<SeasonView>,
      required: false,
    },
    showSeason: {
      type: Object as PropType<ShowSeason>,
      required: false,
    },
    showInfo: {
      type: Object as PropType<ShowInfo>,
      required: false,
    },
  },
  data() {
    return {
      seasonViewData: null as SeasonView | null,
      doEpisodeCountOverall: false as boolean,
      doEpisodeCountUnitsLabel: false as boolean,
    }
  },
  computed: {
    loadedShowInfo(): ShowInfo {
      if (this.showInfo) {
        return this.showInfo
      }
      const showSeasonData = this.seasonViewData ? this.seasonViewData.seasonInfo : this.showSeason
      return this.$store.getters.getShowInfoById(showSeasonData.showId)
    },
    loadedShowSeason(): ShowSeason | null {
      if (this.showSeason) {
        return this.showSeason
      }
      if (this.seasonViewData) {
        return this.seasonViewData.seasonInfo
      }
      return null
    },
    imageLink(): string {
      if (this.seasonViewData || this.showSeason) {
        const showSeasonData = this.seasonViewData ? this.seasonViewData.seasonInfo : this.showSeason
        if (showSeasonData.imgLink) {
          return showSeasonData.imgLink
        }
        return this.$store.getters.getImageLink(showSeasonData.showId, showSeasonData.id)
      } else if (this.showInfo) {
        return this.$store.getters.getShowImageLink(this.showInfo)
      }
      return ''
    },
    overallWatchedEpisodeCount(): number {
      if (this.seasonViewData) {
        const currentSznNumber = this.seasonViewData.seasonInfo.seasonNumber
        return this.seasonViewData.watchedEpisodes + this.loadedShowInfo.seasons.reduce((total: number, szn: ShowSeason) => {
          return total + ((currentSznNumber > szn.seasonNumber && szn.totalEpisodeCount) ? szn.totalEpisodeCount : 0)
        }, 0)
      }
      return 0
    },
    overallTotalEpisodeCount(): number {
      if (this.seasonViewData) {
        return this.loadedShowInfo.seasons.reduce((total: number, szn: ShowSeason) => {
          return total + (szn.totalEpisodeCount ? szn.totalEpisodeCount : 0)
        }, 0)
      }
      return 0
    },
    displayedWatchedEpisodeCount(): number {
      if (this.doEpisodeCountOverall) {
        return this.overallWatchedEpisodeCount
      } else {
        return this.seasonViewData ? this.seasonViewData.watchedEpisodes : 0
      }
    },
    displayedTotalEpisodeCount(): number {
      if (this.doEpisodeCountOverall) {
        return this.overallTotalEpisodeCount
      } else {
        return (this.loadedShowSeason && this.loadedShowSeason.totalEpisodeCount) ? this.loadedShowSeason.totalEpisodeCount : 0
      }
    },
  },
  created() {
    if (this.seasonView) {
      this.seasonViewData = this.seasonView
    }
    this.doEpisodeCountOverall = this.loadedShowInfo.doEpisodeCountOverall || false
  },
  watch: {
    seasonView() {
      this.seasonViewData = this.seasonView
    },
  },
  methods: {
    getViewProgress(view: SeasonView): number[] {
      let amtWatched = view.watchedEpisodes
      let amtTotal = view.seasonInfo.totalEpisodeCount ? view.seasonInfo.totalEpisodeCount : 0
      return [ amtWatched, amtTotal ]
    },
    getProgressBar(view: SeasonView): string {
      let progressPct = 0
      progressPct = this.displayedTotalEpisodeCount ? (100 * this.displayedWatchedEpisodeCount / this.displayedTotalEpisodeCount) : 50
      return `background-image: linear-gradient(to right, hsl(222, 71%, 60%) ${progressPct}%, hsl(222, 71%, 75%) ${progressPct}%);`
    },
    incrementProgress() {
      if (this.seasonViewData) {
        const totalEps = this.seasonViewData.seasonInfo.totalEpisodeCount
        if (totalEps == null || this.seasonViewData.watchedEpisodes < totalEps) {
          this.seasonViewData.watchedEpisodes++
          watchlistService.SaveSeasonViewDebounced(this.seasonViewData)
        }
      }
    },
    toggleEpisodeCountUnits() {
      this.doEpisodeCountUnitsLabel = true
      this.doEpisodeCountOverall = !this.doEpisodeCountOverall
    },
  },
});
</script>

<style>
#full-item {
  display: flex;
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 5px;
}
#item-details {
  flex: 11;
  background-color: #fff8;
}
#info-section {
  display: flex;
  padding: 8px 3px 3px 8px;
}
#item-name > span:first-child {
  font-size: 1.25em;
  font-weight: bold;
}
#item-name > span:nth-child(2) {
  font-size: 0.9em;
}
#viewed-dates {
  font-size: 0.8em;
}
#progress-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #fffd;
  font-size: 0.8em;
  font-weight: bold;
  padding-left: 8px;
  user-select: none;
}
#progress-section > div > span:first-child {
  cursor: pointer;
}
#progress-section .episode-count-units {
  margin-left: 5px;
  font-weight: normal;
  font-size: 0.8em;
  animation: 0.5s linear 2s fadeOut forwards;
}
@keyframes fadeOut {
  from {opacity: 1;}
  to {opacity: 0;}
}
#side-info {
  flex: 1;
  background-color: #0002;
}
#increment-button {
  margin-right: 10px;
  padding: 2px;
  border: none;
  height: 26px;
  width: 26px;
}
</style>