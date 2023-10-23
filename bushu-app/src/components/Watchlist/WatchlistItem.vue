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
      >
        <div>
          Progress:
          <span>
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
  },
});
</script>

<style>
#full-item {
  display: flex;
  width: 100%;
  border-radius: 8px;
  background-color: #0003;
  overflow: hidden;
  margin-bottom: 5px;
}
#item-details {
  flex: 11;
  background-color: #34f;
}
#info-section {
  display: flex;
  padding: 8px 3px 3px 8px;
  background-color: #dfea;
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
  background-color: hsl(192, 80%, 40%);
}
#side-info {
  flex: 1;
}
</style>