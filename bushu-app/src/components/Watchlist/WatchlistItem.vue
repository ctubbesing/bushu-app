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
            v-if="seasonView"
            id="viewed-dates"
          >
            <div v-if="seasonView.beganDate">
              Started {{ seasonView.beganDate | formatDate }}
            </div>
            <div v-if="seasonView.completedDate">
              Completed {{ seasonView.completedDate | formatDate }}
            </div>
          </div>
        </div>
      </div>
      <div
        v-if="seasonView"
        id="progress-section"
        :style="getProgressBar(seasonView)"
      >
        <div>
          Progress:
          <span v-if="loadedShowInfo.doEpisodeCountOverall">
            <span>{{ overallWatchedEpisodeCount ? overallWatchedEpisodeCount : '-' }}</span>
            <span> / {{ overallTotalEpisodeCount ? overallTotalEpisodeCount : '?' }}</span>
          </span>
          <span v-else>
            <span>{{ seasonView.watchedEpisodes ? seasonView.watchedEpisodes : '-' }}</span>
            <span> / {{ loadedShowSeason.totalEpisodeCount ? loadedShowSeason.totalEpisodeCount : '?' }}</span>
          </span>
        </div>
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
  computed: {
    loadedShowInfo(): ShowInfo {
      if (this.showInfo) {
        return this.showInfo
      }
      const showSeasonData = this.seasonView ? this.seasonView.seasonInfo : this.showSeason
      return this.$store.getters.getShowInfoById(showSeasonData.showId)
    },
    loadedShowSeason(): ShowSeason | null {
      if (this.showSeason) {
        return this.showSeason
      }
      if (this.seasonView) {
        return this.seasonView.seasonInfo
      }
      return null
    },
    imageLink(): string {
      if (this.seasonView || this.showSeason) {
        const showSeasonData = this.seasonView ? this.seasonView.seasonInfo : this.showSeason
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
      if (this.seasonView) {
        const currentSznNumber = this.seasonView.seasonInfo.seasonNumber
        return this.seasonView.watchedEpisodes + this.loadedShowInfo.seasons.reduce((total: number, szn: ShowSeason) => {
          return total + ((currentSznNumber > szn.seasonNumber && szn.totalEpisodeCount) ? szn.totalEpisodeCount : 0)
        }, 0)
      }
      return 0
    },
    overallTotalEpisodeCount(): number {
      if (this.seasonView) {
        return this.loadedShowInfo.seasons.reduce((total: number, szn: ShowSeason) => {
          return total + (szn.totalEpisodeCount ? szn.totalEpisodeCount : 0)
        }, 0)
      }
      return 0
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
      if (this.loadedShowInfo.doEpisodeCountOverall) {
        progressPct = this.overallTotalEpisodeCount ? 100 * this.overallWatchedEpisodeCount / this.overallTotalEpisodeCount : 0
      } else {
        progressPct = view.seasonInfo.totalEpisodeCount ? (view.watchedEpisodes / view.seasonInfo.totalEpisodeCount) * 100 : 50
      }
      return `background-image: linear-gradient(to right, hsl(222, 71%, 60%) ${progressPct}%, hsl(222, 71%, 75%) ${progressPct}%);`
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
  color: #fffd;
  font-size: 0.8em;
  font-weight: bold;
  padding-left: 8px;
}
#side-info {
  flex: 1;
  background-color: #0002;
}
</style>