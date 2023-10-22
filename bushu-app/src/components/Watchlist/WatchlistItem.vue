<template>
  <div id="full-item">
    <div id="item-details">
      <div id="info-section">
        <thumbnail-image
          :link="imageLink"
          :height="100"
        />
        <div>
          {{ parentList }} <br>
          <span v-if="parentList === 'upcoming'">
            {{ showSeason.seasonNumber }} <br>
            {{ showSeason.name }} <br>
          </span>
          <span v-else-if="parentList === 'backlog'">
            {{ showInfo.title }} <br>
            {{ showInfo.name }} <br>
          </span>
          <span v-else>
            {{ seasonView.seasonInfo.seasonNumber }} <br>
            {{ seasonView.seasonInfo.name }} <br>
          </span>
        </div>
      </div>
      <div id="progress-section">
        <div>
          Progress: X / XX
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
}
#item-details {
  flex: 11;
  background-color: #34f;
}
#info-section {
  display: flex;
  padding: 5px;
  background-color: #dfea;
}
#progress-section {
  background-color: #d48a;
}
#side-info {
  flex: 1;
}
</style>