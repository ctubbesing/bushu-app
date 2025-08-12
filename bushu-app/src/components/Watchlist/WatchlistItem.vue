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
            <template v-if="parentList !== 'backlog' && loadedShowSeason">
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
              Started {{ formatDate(editedSeasonView.beganDate) }}
            </div>
            <div v-if="editedSeasonView.completedDate">
              Completed {{ formatDate(editedSeasonView.completedDate) }}
            </div>
          </div>
          <div
            v-if="parentList === 'upcoming' && loadedShowSeason"
            id="release-date"
          >
            Airing {{ formatDate(loadedShowSeason.startDate) }}
          </div>
        </div>
      </div>
      <div
        v-if="doProgressBar && editedSeasonView && !isReadOnly"
        id="progress-section"
        :style="getProgressBar()"
        :key="rerenderKey"
      >
        <div
          v-if="editedSeasonView.beganDate"
          class="counts"
        >
          <span @click="toggleEpisodeCountUnits">
            Progress:
          </span>
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
          <span> / </span>
          <span v-if="!releaseSchedule || releaseSchedule.length === 0">
            {{ displayedTotalEpisodeCount ? displayedTotalEpisodeCount : '?' }}
          </span>
          <div
            v-else
            class="live-episode-release-details"
          >
            <table>
              <tr>
                <td>
                  {{ displayedAvailableEpisodeCount ? displayedAvailableEpisodeCount : '?' }}
                </td>
                <td>
                  available
                </td>
              </tr>
              <tr>
                <td>
                  {{ displayedTotalEpisodeCount ? displayedTotalEpisodeCount : '?' }}
                </td>
                <td>
                  total
                </td>
              </tr>
            </table>
          </div>
          <span
            v-if="doEpisodeCountUnitsLabel"
            class="episode-count-units"
            :key="`${doEpisodeCountOverall}`"
          >
            ({{ doEpisodeCountOverall ? 'Overall' : 'This season' }})
          </span>
        </div>
        <div
          v-if="!editedSeasonView.beganDate"
          style="width: 100%; text-align: center"
        >
          <div
            id="begin-watching-button"
            @click="beginSeason"
          >
            Begin watching
          </div>
        </div>
        <v-btn
          icon="mdi-plus"
          variant="tonal"
          class="my-1 mx-2"
          style="height: 20px; width: 20px;"
          @click="incrementProgress()"
        />
      </div>
      <div
        v-if="!isReadOnly && (itemMessages.length > 0 || itemButton)"
        id="modify-item-container"
      >
        <div
          v-for="(message, idx) in itemMessages"
          :key="idx"
        >
          {{ message }}
        </div>
        <div
          v-if="itemButton != null"
          id="modify-item-button"
          @click="itemButton.action(...itemButton.args)"
        >
          {{ itemButton.label }}
        </div>
      </div>
    </div>
    <div
      v-if="!isReadOnly"
      id="side-info"
    >
      <base-dropdown 
        icon="mdi-dots-vertical"
        :options="dropdownOptions"
      />
      <div style="text-align: center">
        <img
          v-if="isReorderable"
          src="@/assets/dragHandle.svg"
          class="drag-handle"
        >
      </div>
    </div>
    <!-- Release Schedule Modal -->
    <!-- <release-schedule-modal
      v-if="doReleaseSchedule && loadedShowSeason"
      :release-schedule="releaseSchedule"
      :show-season="loadedShowSeason"
      :available-episode-count="availableEpisodeCount"
      :parent-list="parentList"
      @irregular-seasons-updated="$emit('irregular-seasons-updated')"
    >
      <template v-slot:item-info>
        <watchlist-item
          :show-season="loadedShowSeason"
          :is-read-only="true"
        />
      </template>
    </release-schedule-modal> -->
  </div>
</template>

<script lang="ts">
import { useWatchlist } from '@/stores/watchlist'
import type {
  EpisodeDate,
  RawEpisodeDate,
  SeasonView,
  ShowInfo,
  ShowSeason
} from '@/types/watchlistTypes'
import formatDate from '@/utils/formatDate'
import WatchlistService from '@/utils/services/WatchlistService'
import tools from '@/utils/tools'
import { DateTime } from 'luxon'
import { mapStores } from 'pinia'
import type { PropType } from 'vue'
import ThumbnailImage from '../ThumbnailImage.vue'
import BaseDropdown from '../utils/BaseDropdown.vue'
import type { BaseDropdownOption } from '../utils/types/baseTypes'

export default {
  components: {
    // releaseScheduleModal: ReleaseScheduleModal,
    ThumbnailImage,
    BaseDropdown,
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
    ...mapStores(useWatchlist),
    loadedShowInfo(): ShowInfo | null {
      if (this.showInfo) {
        return this.showInfo
      }
      const showSeasonData = this.editedSeasonView ? this.editedSeasonView.seasonInfo : this.showSeason
      return showSeasonData ? this.watchlistStore.getShowInfoById(showSeasonData.showId) : null
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
          return this.watchlistStore.getImageLink(showSeasonData.showId, showSeasonData.id)
        }
      } else if (this.showInfo) {
        return this.watchlistStore.getShowImageLink(this.showInfo)
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
    isDemotable(): boolean {
      return this.parentList === 'main' || this.parentList === 'live'
    },
    hasBegunAiring(): boolean {
      if (this.loadedShowSeason && this.loadedShowSeason.startDate) {
        const today = tools.getToday()
        return this.loadedShowSeason.startDate <= today
      }
      return false
    },
    doReleaseSchedule(): boolean {
      return this.parentList === 'live' || this.parentList === 'upcoming'
    },
    releaseSchedule(): EpisodeDate[] {
      let episodeDates: EpisodeDate[] = []
      if (this.doReleaseSchedule && this.loadedShowSeason && this.loadedShowSeason.startDate) {
        let startDate = DateTime.fromISO(this.loadedShowSeason.startDate)
        if (startDate.isValid)
        {
          episodeDates = [{
            episode: 1,
            date: startDate,
          }]
          let episodeCount = this.loadedShowSeason.totalEpisodeCount ?? 30
          let previousDate: DateTime = startDate
          for (let i = 1; i < episodeCount; i++) {
            let nextIrregularDate = this.loadedShowSeason.irregularDates?.find((d: RawEpisodeDate) => d.episode >= i + 1)

            let currentDate: DateTime
            if (nextIrregularDate?.episode === i + 1) {
              currentDate = DateTime.fromISO(nextIrregularDate.date)
            } else {
              let nextWeekDate = previousDate.plus({days: 7})
              currentDate = nextIrregularDate ? DateTime.min(DateTime.fromISO(nextIrregularDate.date), nextWeekDate) : nextWeekDate
            }

            previousDate = currentDate

            episodeDates.push({
              episode: i + 1,
              date: currentDate
            })
          }
        }
      }
      return episodeDates
    },
    availableEpisodeCount(): number {
      let today = DateTime.now()
      return this.releaseSchedule.filter((d: EpisodeDate) => d.date <= today).length
    },
    displayedAvailableEpisodeCount(): number {
      let thisSeasonEpisodes = ((this.loadedShowSeason?.totalEpisodeCount) ? this.loadedShowSeason.totalEpisodeCount : 0)
      let thisSeasonNotYetAvailable = Math.max(0, thisSeasonEpisodes - this.availableEpisodeCount)
      if (this.doEpisodeCountOverall) {
        return this.overallTotalEpisodeCount - thisSeasonNotYetAvailable
      } else {
        return this.availableEpisodeCount
      }
    },
    isSeasonFullyReleased(): boolean {
      return this.availableEpisodeCount === (this.loadedShowSeason?.totalEpisodeCount ?? -1)
    },
    isUpToDateWithLiveSeason(): boolean {
      return this.parentList === 'live' && this.editedSeasonView?.watchedEpisodes === this.availableEpisodeCount
    },
    itemMessages(): string[] {
      let messages: string[] = []
      if (this.parentList === 'live' && !this.isSeasonFullyReleased) {
        if (this.isUpToDateWithLiveSeason) {
          messages.push('Up to date!')
        }
        messages.push(`Next episode expected ${this.formatReleaseDate(this.releaseSchedule[this.availableEpisodeCount].date)}`)
      } else if (this.parentList === 'upcoming' && this.hasBegunAiring) {
        messages.push('This item has begun airing!')
      }
      return messages
    },
    itemButton(): { label: string, action: (...args: string[]) => void, args: string[] } | null {
      if (this.isSeasonProgressComplete && !this.isReadOnly) {
        return {
          label: 'Mark season completed',
          action: this.markSeasonCompleted,
          args: [],
        }
      }
      if (this.parentList === 'upcoming' && this.hasBegunAiring) {
        return {
          label: 'Move to Live',
          action: this.promoteItem,
          args: ['live'],
        }
      }
      return null
    },
    dropdownOptions(): BaseDropdownOption[] {
      let options: BaseDropdownOption[] = []

      if (this.isPromotable) {
        options.push({
          title: `Promote to ${this.parentList === 'queue' ? 'Main' : 'Queue'}`,
        })
      }

      if (this.parentList === 'upcoming') {
        options.push({
          title: 'Promote to Live',
          clickEvent: () => this.promoteItem('live'),
        })
        options.push({
          title: 'Promote to Main',
          clickEvent: () => this.promoteItem('main'),
        })
      }

      if (this.parentList === 'live') {
        options.push({
          title: 'Move to Main',
          clickEvent: this.promoteItem,
        })
      }

      if (this.isDemotable) {
        options.push({
          title: 'Demote to Queue',
          clickEvent: this.demoteItem,
        })
      }

      options.push({
        title: this.seasonView ? 'Drop' : 'Remove',
        clickEvent: this.removeItem,
      })

      if (this.doReleaseSchedule) {
        options.push({
          title: 'View Release Schedule',
          clickEvent: this.openScheduleModal,
        })
      }

      return options
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
    formatDate(dateStr: string | undefined) {
      return formatDate(dateStr)
    },
    formatReleaseDate(date: DateTime) {
      return date.toFormat('EEEE, M/d/yyyy')
    },
    getProgressBar(): string {
      let progressBarStyle = `border-radius: 0 0 0 ${(this.itemMessages.length > 0 || this.itemButton) ? '0' : '8px'};`

      let progressPct = -1
      let availablePct = -1
      if (this.displayedTotalEpisodeCount) {
        progressPct = 100 * this.displayedEpisodeProgress / this.displayedTotalEpisodeCount

        if (this.displayedAvailableEpisodeCount && this.parentList === 'live' && this.editedSeasonView?.beganDate) {
          availablePct = 100 * this.displayedAvailableEpisodeCount / this.displayedTotalEpisodeCount
        }

        progressBarStyle += `background-image: linear-gradient(to right, ` +
                            `hsl(222, 71%, 60%) ${progressPct}%, ` +
                            ( availablePct === -1 ? '' : `hsl(222, 60%, 67.5%) ${progressPct}%, `) +
                            ( availablePct === -1 ? '' : `hsl(222, 60%, 67.5%) ${availablePct}%, `) +
                            `hsl(222, 71%, 75%) ${Math.max(progressPct, availablePct)}%);`
      } else {
        progressBarStyle += `background-image: linear-gradient(to right, hsl(222, 71%, 60%) 25%, hsl(222, 71%, 75%) 75%);`
      }

      return progressBarStyle
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
    promoteItem(destination: string | undefined = undefined) {
      this.$emit('promote-item', destination)
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
        WatchlistService.SaveSeasonViewDebounced(this.editedSeasonView)
        this.$emit('season-view-updated', this.editedSeasonView)
      }
    },
    openScheduleModal() {
      if (this.loadedShowSeason) {
        console.log('TODO: schedule modal')
        // this.$bvModal.show(`release-schedule-modal-${this.parentList}-${this.loadedShowSeason.id}`)
      }
    },
  },
}
</script>

<style scoped>
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
#release-date {
  font-size: 0.8em;
}
#progress-section {
  display: flex;
  justify-content: space-between;
  min-height: 26px;
  align-items: center;
  color: #fffd;
  font-size: 0.8em;
  font-weight: bold;
  padding-left: 8px;
  user-select: none;
}
#progress-section > .counts {
  display: flex;
  align-items: center;
}
#progress-section > div:first-child > span {
  margin-right: 4px;
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
.live-episode-release-details {
  line-height: 15.5px
}
.live-episode-release-details td:first-child {
  text-align: right;
}
.live-episode-release-details td:nth-child(2) {
  padding-left: 3px;
  font-size: 0.8em;
  font-weight: normal;
}
#side-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
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
#modify-item-container {
  text-align: center;
  padding: 3px;
  border-radius: 0 0 0 8px;
  background-color: hsl(222, 71%, 60%, 0.2);
  color: hsl(222, 71%, 60%);
  font-size: 0.7rem;
  font-weight: bold;
}
#modify-item-button {
  display: inline-block;
  padding: 2px 6px;
  margin: auto 3px;
  border-radius: 4px;
  background-color: hsl(222, 71%, 60%);
  color: #fffd;
  font-size: 1.3rem;
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
#modify-item-button:hover, #begin-watching-button:hover {
  background-color: hsl(222, 71%, 70%);
}
#modify-item-button:active, #begin-watching-button:active {
  background-color: hsl(222, 71%, 65%);
}
</style>
