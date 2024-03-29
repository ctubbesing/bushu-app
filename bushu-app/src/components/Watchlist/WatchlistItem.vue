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
          <div
            v-if="loadedShowInfo"
            id="item-name"
          >
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
            v-if="editedSeasonView"
            id="viewed-dates"
          >
            <div v-if="editedSeasonView.beganDate">
              Started {{ editedSeasonView.beganDate | formatDate }}
            </div>
            <div v-if="editedSeasonView.completedDate">
              Completed {{ editedSeasonView.completedDate | formatDate }}
            </div>
          </div>
        </div>
      </div>
      <div
        v-if="doProgressBar && editedSeasonView && !isReadOnly"
        id="progress-section"
        :style="getProgressBar()"
        :key="rerenderKey"
      >
        <div v-if="editedSeasonView.beganDate">
          <span @click="toggleEpisodeCountUnits">
            Progress:
          </span>
          <span>
            <span
              v-if="!doManualProgressEdit"
              @click="enableManualProgressEdit"
              style="cursor: pointer"
            >
              {{ displayedEpisodeProgress ? displayedEpisodeProgress : '-' }}
            </span>
            <span
              v-else
              style="display: inline-block"
            >
              <b-form-input
                type="number"
                v-model.number="editedProgress"
                :max="maxValidProgress"
                :min="minValidProgress"
                :state="isEditedProgressValid ? null : false"
                size="sm"
                style="width: 75px; font-size: 0.8em"
                inputmode="numeric"
                pattern="[0-9]*"
                autofocus
                @blur="saveManualProgressEdit"
                @keyup.enter="saveManualProgressEdit"
              />
            </span>
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
        <hover-icon
          v-if="editedSeasonView.beganDate"
          id="increment-button"
          icon="plus-circle"
          scale="1.3"
          variant="light"
          @click="incrementProgress()"
        />
        <div
          v-else
          style="width: 100%; text-align: center"
        >
          <div
            id="begin-watching-button"
            @click="beginSeason"
          >
            Begin watching
          </div>
        </div>
      </div>
      <div
        v-if="isSeasonProgressComplete && !isReadOnly"
        id="mark-completed-container"
      >
        <div
          id="mark-completed-button"
          @click="markSeasonCompleted"
        >
          Mark season completed
        </div>
      </div>
    </div>
    <div
      v-if="!isReadOnly"
      id="side-info"
    >
      <b-dropdown
        right
        no-caret
        toggle-class="text-decoration-none"
        variant="transparent"
        size="sm"
      >
        <template #button-content>
          <b-icon icon="three-dots-vertical" />
        </template>
        <slot name="dropdown-items">
          <b-dropdown-item
            v-if="isPromotable"
            @click="promoteItem"
          >
            Promote to {{ parentList === 'queue' ? 'Main' : 'Queue' }}
          </b-dropdown-item>
          <b-dropdown-item
            v-if="parentList === 'main'"
            @click="demoteItem"
          >
            Demote to Queue
          </b-dropdown-item>
          <b-dropdown-item @click="removeItem">
            {{ seasonView ? 'Drop' : 'Remove' }}
          </b-dropdown-item>
        </slot>
      </b-dropdown>
      <div style="text-align: center">
        <img
          v-if="isReorderable"
          src="@/assets/dragHandle.svg"
          class="drag-handle"
        >
      </div>
    </div>
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
import HoverIcon from '@/components/utils/HoverIcon.vue'
import watchlistService from '@/utils/services/WatchlistService'
import tools from '@/utils/tools'

export default Vue.extend({
  name: 'WatchlistItem',
  components: {
    thumbnailImage: ThumbnailImage,
    hoverIcon: HoverIcon,
  },
  props: {
    parentList: {
      type: String,
      required: false,
      default: 'queue',
    },
    seasonView: {
      type: Object as PropType<SeasonView | undefined>,
      required: false,
    },
    showSeason: {
      type: Object as PropType<ShowSeason | undefined>,
      required: false,
    },
    showInfo: {
      type: Object as PropType<ShowInfo | undefined>,
      required: false,
    },
    isReadOnly: {
      type: Boolean,
      required: false,
      default: false,
    },
    isReorderable: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  data() {
    return {
      editedSeasonView: null as SeasonView | null,
      doEpisodeCountOverall: false as boolean,
      doEpisodeCountUnitsLabel: false as boolean,
      doManualProgressEdit: false as boolean,
      editedProgress: 0 as number,
      rerenderKey: '' as string,
    }
  },
  computed: {
    loadedShowInfo(): ShowInfo | null {
      if (this.showInfo) {
        return this.showInfo
      }
      const showSeasonData = this.editedSeasonView ? this.editedSeasonView.seasonInfo : this.showSeason
      return showSeasonData ? this.$store.getters.getShowInfoById(showSeasonData.showId) : null
    },
    loadedShowSeason(): ShowSeason | null {
      if (this.showSeason) {
        return this.showSeason
      }
      if (this.editedSeasonView) {
        return this.editedSeasonView.seasonInfo
      }
      return null
    },
    imageLink(): string {
      if (this.editedSeasonView || this.showSeason) {
        const showSeasonData = this.editedSeasonView ? this.editedSeasonView.seasonInfo : this.showSeason
        if (showSeasonData?.imgLink) {
          return showSeasonData.imgLink
        } else if (showSeasonData != undefined) {
          return this.$store.getters.getImageLink(showSeasonData.showId, showSeasonData.id)
        }
      } else if (this.showInfo) {
        return this.$store.getters.getShowImageLink(this.showInfo)
      }
      return ''
    },
    doProgressBar(): boolean {
      return this.parentList === 'main' || this.parentList === 'live'
    },
    previousSeasonsEpisodeCount(): number {
      if (this.loadedShowSeason && this.loadedShowInfo) {
        const currentSznNumber = this.loadedShowSeason.seasonNumber
        return this.loadedShowInfo.seasons.reduce((total: number, szn: ShowSeason) => {
          return total + ((currentSznNumber > szn.seasonNumber && szn.totalEpisodeCount) ? szn.totalEpisodeCount : 0)
        }, 0)
      }
      return 0
    },
    overallEpisodeProgress(): number {
      if (this.editedSeasonView) {
        return this.editedSeasonView.watchedEpisodes + this.previousSeasonsEpisodeCount
      }
      return 0
    },
    overallTotalEpisodeCount(): number {
      if (this.editedSeasonView && this.loadedShowInfo) {
        return this.loadedShowInfo.seasons.reduce((total: number, szn: ShowSeason) => {
          return total + (szn.totalEpisodeCount ? szn.totalEpisodeCount : 0)
        }, 0)
      }
      return 0
    },
    displayedEpisodeProgress(): number {
      if (this.doEpisodeCountOverall) {
        return this.overallEpisodeProgress
      } else {
        return this.editedSeasonView ? this.editedSeasonView.watchedEpisodes : 0
      }
    },
    displayedTotalEpisodeCount(): number {
      if (this.doEpisodeCountOverall) {
        return this.overallTotalEpisodeCount
      } else {
        return (this.loadedShowSeason && this.loadedShowSeason.totalEpisodeCount) ? this.loadedShowSeason.totalEpisodeCount : 0
      }
    },
    minValidProgress(): number {
      return this.doEpisodeCountOverall ? this.previousSeasonsEpisodeCount : 0
    },
    maxValidProgress(): number {
      const currentSznTotalEpisodes: number | null | undefined = this.loadedShowSeason?.totalEpisodeCount
      if (currentSznTotalEpisodes == null) {
        return Infinity
      }
      return currentSznTotalEpisodes + this.minValidProgress
    },
    isEditedProgressValid(): boolean {
      return this.editedProgress >= this.minValidProgress &&
             this.editedProgress <= this.maxValidProgress
    },
    isSeasonProgressComplete(): boolean {
      if (this.loadedShowSeason?.totalEpisodeCount) {
        return this.loadedShowSeason.totalEpisodeCount === this.editedSeasonView?.watchedEpisodes
      }
      return false
    },
    isPromotable(): boolean {
      return this.parentList === 'queue' || this.parentList === 'backlog'
    },
  },
  created() {
    if (this.seasonView) {
      this.editedSeasonView = this.seasonView
    }
    this.doEpisodeCountOverall = this.loadedShowInfo?.doEpisodeCountOverall || false
  },
  watch: {
    seasonView() {
      this.editedSeasonView = this.seasonView ?? null
    },
  },
  methods: {
    getViewProgress(view: SeasonView): number[] {
      let amtWatched = view.watchedEpisodes
      let amtTotal = view.seasonInfo.totalEpisodeCount ? view.seasonInfo.totalEpisodeCount : 0
      return [ amtWatched, amtTotal ]
    },
    getProgressBar(): string {
      let progressPct = 0
      progressPct = this.displayedTotalEpisodeCount ? (100 * this.displayedEpisodeProgress / this.displayedTotalEpisodeCount) : 50
      return `background-image: linear-gradient(to right, hsl(222, 71%, 60%) ${progressPct}%, hsl(222, 71%, 75%) ${progressPct}%);`
    },
    incrementProgress() {
      if (this.editedSeasonView) {
        const totalEps = this.editedSeasonView.seasonInfo.totalEpisodeCount
        if (totalEps == null || this.editedSeasonView.watchedEpisodes < totalEps) {
          this.editedSeasonView.watchedEpisodes++
          this.saveChanges()
        }
      }
    },
    toggleEpisodeCountUnits() {
      this.doEpisodeCountUnitsLabel = true
      this.doEpisodeCountOverall = !this.doEpisodeCountOverall
    },
    enableManualProgressEdit() {
      this.doManualProgressEdit = true
      this.editedProgress = this.displayedEpisodeProgress
    },
    saveManualProgressEdit() {
      if (this.editedSeasonView) {
        if (this.isEditedProgressValid && this.editedProgress !== this.displayedEpisodeProgress) {
          const seasonProgress = this.doEpisodeCountOverall ? (this.editedProgress - this.previousSeasonsEpisodeCount) : this.editedProgress
          this.editedSeasonView.watchedEpisodes = seasonProgress
          this.saveChanges()
        }
        this.doManualProgressEdit = false
      }
    },
    beginSeason() {
      if (this.editedSeasonView && !this.editedSeasonView.beganDate) {
        this.editedSeasonView.beganDate = tools.getTimestamp()
        this.saveChanges()
      }
      this.rerenderKey = tools.getTimestamp()
    },
    promoteItem() {
      this.$emit('promote-item')
    },
    demoteItem() {
      this.$emit('demote-item')
    },
    removeItem() {
      this.$emit('remove-item')
    },
    markSeasonCompleted() {
      this.$emit('mark-completed')
    },
    saveChanges() {
      if (this.editedSeasonView) {
        watchlistService.SaveSeasonViewDebounced(this.editedSeasonView)
      }
    },
  },
});
</script>

<style>
#full-item {
  display: flex;
  width: 100%;
  border-radius: 8px;
  margin-bottom: 5px;
}
#item-details {
  flex: 11;
  background-color: #fff8;
  border-radius: 8px 0 0 8px;
}
#info-section {
  display: flex;
  padding: 8px 3px 3px 8px;
}
#info-section:last-child {
  padding-bottom: 8px;
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
  border-radius: 0 0 0 8px;
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
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 8px 0;
  background-color: #0002;
  border-radius: 0 8px 8px 0;
}
.drag-handle {
  width: 75%;
  cursor: grab;
}
#increment-button {
  margin: 3px 10px;
  height: 20px;
  width: 20px;
}
#mark-completed-container {
  display: flex;
  justify-content: center;
  padding: 3px;
}
#mark-completed-button {
  padding: 2px 4px;
  margin: auto 3px;
  border-radius: 4px;
  background-color: hsl(222, 71%, 60%);
  color: #fffd;
  font-size: 1.3em;
  font-weight: bold;
  cursor: pointer;
  user-select: none;
}
#begin-watching-button {
  display: inline-block;
  padding: 2px 4px;
  margin: 2px 3px;
  border-radius: 4px;
  background-color: hsl(222, 71%, 60%);
  color: #fffd;
  font-size: 1.3em;
  font-weight: bold;
  cursor: pointer;
  user-select: none;
}
#mark-completed-button:hover, #begin-watching-button:hover {
  background-color: hsl(222, 71%, 70%);
}
#mark-completed-button:active, #begin-watching-button:active {
  background-color: hsl(222, 71%, 65%);
}
</style>