<template>
  <div id="full-item">
    <div id="item-details">
      <div id="info-section">
        <ThumbnailImage
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
            <template v-if="parentList !== 'Backlog' && loadedShowSeason">
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
              Started {{ formatDate(seasonView.beganDate) }}
            </div>
            <div v-if="seasonView.completedDate">
              Completed {{ formatDate(seasonView.completedDate) }}
            </div>
          </div>
          <div
            v-if="parentList === 'Upcoming' && loadedShowSeason"
            id="release-date"
          >
            Airing {{ formatDate(loadedShowSeason.startDate) }}
          </div>
        </div>
      </div>
      <div
        v-if="doProgressBar && seasonView && !isReadOnly"
        id="progress-section"
        :style="getProgressBar()"
        >
        <!-- /////////////// TODO: still need this? -->
        <!-- :key="rerenderKey" -->
        <div
          v-if="seasonView.beganDate"
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
            <v-number-input
              v-model="editedProgress"
              :max="maxValidProgress"
              :min="minValidProgress"
              :rules="[isEditedProgressValid]"
              density="compact"
              style="height: 32px"
              class="episode-count-input"
              variant="solo"
              inset
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
          v-if="!seasonView.beganDate"
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
          size="x-small"
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
      <BaseDropdown
        icon="mdi-dots-vertical"
        :options="dropdownOptions"
      />
      <!-- //////// TODO: draggable items are disabled for now until a better draggable system is made -->
      <!-- <div style="text-align: center">
        <img
          v-if="isReorderable"
          src="@/assets/dragHandle.svg"
          class="drag-handle"
        >
      </div> -->
    </div>
    <!-- Release Schedule Modal -->
    <ReleaseScheduleModal
      v-if="!isReadOnly && doReleaseSchedule && loadedShowSeason"
      :show-season="loadedShowSeason"
      :available-episode-count="availableEpisodeCount"
      :value="showReleaseScheduleModal"
      @input="(e: boolean) => showReleaseScheduleModal = e"
    />
    <!-- TODO: clean up this v-model once RSM is updated to composition API -->
    <!-- v-model="showReleaseScheduleModal" -->
  </div>
</template>

<script lang="ts" setup>
import { useWatchlist } from '@/stores/watchlist'
import { EpisodeDate, ListType, SeasonView, ShowInfo, type ShowSeason } from '@/types/watchlistTypes'
import formatDate from '@/utils/formatDate'
import watchlistService from '@/utils/services/watchlistService'
import tools from '@/utils/tools'
import { DateTime } from 'luxon'
import { computed, ref } from 'vue'
import ThumbnailImage from '../ThumbnailImage.vue'
import ReleaseScheduleModal from './ReleaseScheduleModal.vue'
import BaseDropdown from '../utils/BaseDropdown.vue'
import type { BaseDropdownOption } from '../utils/types/baseTypes'
import buildReleaseSchedule from '@/utils/watchlist/buildReleaseSchedule'

const seasonView = defineModel<SeasonView>()

const props = defineProps<{
  parentList: ListType,
  showSeason?: ShowSeason,
  showInfo?: ShowInfo,
  isReadOnly?: boolean,
  isReorderable: boolean,
}>()

const emit = defineEmits<{
  'promote-item': [destination: string | undefined],
  'demote-item': [],
  'remove-item': [],
  'mark-completed': [],
  // 'season-view-updated': [],
}>()

const watchlistStore = useWatchlist()

const loadedShowInfo = computed((): ShowInfo | undefined => {
  if (props.showInfo) {
    return props.showInfo
  }
  const showSeasonData = seasonView.value?.seasonInfo ?? props.showSeason
  return showSeasonData ? watchlistStore.getShowInfoById(showSeasonData.showId) : undefined
})

const loadedShowSeason = computed((): ShowSeason | null => props.showSeason ?? seasonView.value?.seasonInfo ?? null)

const imageLink = computed((): string => {
  if (seasonView.value || props.showSeason) {
    const showSeasonData = seasonView.value?.seasonInfo ?? props.showSeason
    if (showSeasonData) {
      return showSeasonData.imgLink ?? watchlistStore.getImageLink(showSeasonData.showId, showSeasonData.id)
    } 
  } else if (props.showInfo) {
    return watchlistStore.getShowImageLink(props.showInfo)
  }
  return ''
})

const previousSeasonsEpisodeCount = computed((): number => {
  if (loadedShowSeason.value && loadedShowInfo.value) {
    const currentSznNumber = loadedShowSeason.value.seasonNumber
    return loadedShowInfo.value.seasons.reduce((total: number, szn: ShowSeason) => {
      return total + ((currentSznNumber > szn.seasonNumber && szn.totalEpisodeCount) ? szn.totalEpisodeCount : 0)
    }, 0)
  }
  return 0
})

const doReleaseSchedule = computed((): boolean => props.parentList === ListType.enum.Live || props.parentList === ListType.enum.Upcoming)

const releaseSchedule = computed((): EpisodeDate[] => {
  if (doReleaseSchedule.value && loadedShowSeason.value) {
    return buildReleaseSchedule(loadedShowSeason.value)
  }
  return []
})

const availableEpisodeCount = computed((): number => {
  let today = DateTime.now()
  return releaseSchedule.value.filter((d: EpisodeDate) => d.date <= today).length
})

const displayedAvailableEpisodeCount = computed((): number => {
  let thisSeasonEpisodes = loadedShowSeason.value?.totalEpisodeCount ?? 0
  let thisSeasonNotYetAvailable = Math.max(0, thisSeasonEpisodes - availableEpisodeCount.value)
  if (doEpisodeCountOverall.value) {
    return overallTotalEpisodeCount.value - thisSeasonNotYetAvailable
  } else {
    return availableEpisodeCount.value
  }
})

const overallTotalEpisodeCount = computed((): number => {
  if (seasonView.value && loadedShowInfo.value) {
    return loadedShowInfo.value.seasons.reduce((total: number, szn: ShowSeason) => {
      return total + (szn.totalEpisodeCount ? szn.totalEpisodeCount : 0)
    }, 0)
  }
  return 0
})

const doEpisodeCountOverall = ref(false)
const doEpisodeCountUnitsLabel = ref(false)
const toggleEpisodeCountUnits = () => {
  doEpisodeCountUnitsLabel.value = true
  doEpisodeCountOverall.value = !doEpisodeCountOverall.value
}

const displayedTotalEpisodeCount = computed((): number => {
  if (doEpisodeCountOverall.value) {
    return overallTotalEpisodeCount.value
  } else {
    return loadedShowSeason.value?.totalEpisodeCount ?? 0
  }
})

const overallEpisodeProgress = computed((): number => {
  if (seasonView.value) {
    return seasonView.value.watchedEpisodes + previousSeasonsEpisodeCount.value
  }
  return 0
})

const displayedEpisodeProgress = computed((): number => {
  if (doEpisodeCountOverall.value) {
    return overallEpisodeProgress.value
  }
  return seasonView.value?.watchedEpisodes ?? 0
})

const doProgressBar = computed((): boolean => props.parentList === ListType.enum.Main || props.parentList === ListType.enum.Live)

const getProgressBar = (): string => {
let progressBarStyle = `border-radius: 0 0 0 ${(itemMessages.value.length > 0 || itemButton.value) ? '0' : '8px'};`

  let progressPct = -1
  let availablePct = -1
  if (displayedTotalEpisodeCount.value) {
    progressPct = 100 * displayedEpisodeProgress.value / displayedTotalEpisodeCount.value

    if (displayedAvailableEpisodeCount.value && props.parentList === 'Live' && seasonView.value?.beganDate) {
      availablePct = 100 * displayedAvailableEpisodeCount.value / displayedTotalEpisodeCount.value
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
}

const formatReleaseDate = (date: DateTime): string => date.toFormat('EEEE, M/d/yyyy')

const hasBegunAiring = computed((): boolean => loadedShowSeason.value?.startDate ? loadedShowSeason.value?.startDate <= tools.getToday() : false)
const isSeasonFullyReleased = computed((): boolean => availableEpisodeCount.value === (loadedShowSeason.value?.totalEpisodeCount ?? -1))
const isUpToDateWithLiveSeason = computed((): boolean => props.parentList === 'Live' && seasonView.value?.watchedEpisodes === availableEpisodeCount.value)
const isSeasonProgressComplete = computed((): boolean => (loadedShowSeason.value?.totalEpisodeCount ?? false) === seasonView.value?.watchedEpisodes)

const itemMessages = computed((): string[] => {
  let messages: string[] = []
  if (props.parentList === 'Live' && !isSeasonFullyReleased.value) {
    if (isUpToDateWithLiveSeason.value) {
      messages.push('Up to date!')
    }
    messages.push(`Next episode expected ${formatReleaseDate(releaseSchedule.value[availableEpisodeCount.value].date)}`)
  } else if (props.parentList === 'Upcoming' && hasBegunAiring.value) {
    messages.push('This item has begun airing!')
  }
  return messages
})

type ActionButton = {
  label: string,
  action: (...args: ListType[]) => void,
  args: ListType[],
}
const itemButton = computed((): ActionButton | null => {
  if (isSeasonProgressComplete.value && !props.isReadOnly) {
    return {
      label: 'Mark season completed',
      action: markSeasonCompleted,
      args: [],
    }
  }
  if (props.parentList === 'Upcoming' && hasBegunAiring.value) {
    return {
      label: 'Move to Live',
      action: promoteItem,
      args: [ListType.enum.Live],
    }
  }
  return null
})

const doManualProgressEdit = ref(false)
const editedProgress = ref(0)
const enableManualProgressEdit = () => {
  doManualProgressEdit.value = true
  editedProgress.value = displayedEpisodeProgress.value
}

const minValidProgress = computed((): number => doEpisodeCountOverall.value ? previousSeasonsEpisodeCount.value : 0)

const maxValidProgress = computed((): number => {
  const currentSznTotalEpisodes: number | null | undefined = loadedShowSeason.value?.totalEpisodeCount
  if (currentSznTotalEpisodes == null) {
    return Infinity
  }
  return currentSznTotalEpisodes + minValidProgress.value
})

const isEditedProgressValid = computed((): boolean => editedProgress.value >= minValidProgress.value && editedProgress.value <= maxValidProgress.value)

const saveManualProgressEdit = () => {
  if (seasonView.value) {
    if (isEditedProgressValid.value && editedProgress.value !== displayedEpisodeProgress.value) {
      const seasonProgress = editedProgress.value - (doEpisodeCountOverall.value ? previousSeasonsEpisodeCount.value : 0)
      seasonView.value.watchedEpisodes = seasonProgress
      saveChanges()
    }
    doManualProgressEdit.value = false
  }
}

const incrementProgress = () => {
  if (seasonView.value) {
    const totalEps = seasonView.value.seasonInfo.totalEpisodeCount
    if (totalEps == null || seasonView.value.watchedEpisodes < totalEps) {
      seasonView.value.watchedEpisodes++
      saveChanges()
    }
  }
}

const beginSeason = () => {
  if (seasonView.value && !seasonView.value.beganDate) {
    seasonView.value.beganDate = tools.getTimestamp()
    saveChanges()
  }
  // rerenderKey.value = tools.getTimestamp() /////////// TODO: still need?
}

const promoteItem = (destination: ListType | undefined = undefined) => emit('promote-item', destination)
const demoteItem = () => emit('demote-item')
const removeItem = () => emit('remove-item')
const markSeasonCompleted = () => emit('mark-completed')

const isPromotable = computed((): boolean => props.parentList === ListType.enum.Queue || props.parentList === ListType.enum.Backlog)
const isDemotable = computed((): boolean => props.parentList === ListType.enum.Main || props.parentList === ListType.enum.Live)

const showReleaseScheduleModal = ref(false)

const dropdownOptions = computed((): BaseDropdownOption[] => {
  let options: BaseDropdownOption[] = []

  if (isPromotable.value) {
    options.push({
      title: `Promote to ${props.parentList === ListType.enum.Queue ? 'Main' : 'Queue'}`,
    })
  }

  if (props.parentList === ListType.enum.Upcoming) {
    options.push({
      title: 'Promote to Live',
      clickEvent: () => promoteItem(ListType.enum.Live),
    })
    options.push({
      title: 'Promote to Main',
      clickEvent: () => promoteItem(ListType.enum.Main),
    })
  }

  if (props.parentList === ListType.enum.Live) {
    options.push({
      title: 'Move to Main',
      clickEvent: promoteItem,
    })
  }

  if (isDemotable.value) {
    options.push({
      title: 'Demote to Queue',
      clickEvent: demoteItem,
    })
  }

  options.push({
    title: seasonView.value ? 'Drop' : 'Remove',
    clickEvent: removeItem,
  })

  if (doReleaseSchedule.value) {
    options.push({
      title: 'View Release Schedule',
      clickEvent: () => showReleaseScheduleModal.value = true,
    })
  }

  return options
})

const saveChanges = () => {
  if (seasonView.value) {
    watchlistService.SaveSeasonViewDebounced(seasonView.value)
    // this.$emit('season-view-updated', seasonView.value) ////////// don't need this i think bc model
  }
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

.episode-count-input :deep(.v-btn--icon.v-btn--density-default),
.episode-count-input :deep(.v-number-input__control),
.episode-count-input :deep(div),
.episode-count-input :deep(input),
.episode-count-input :deep(.v-field__append-inner) {
  max-height: 32px !important;
}

.episode-count-input :deep(input) {
  height: 32px !important;
  font-size: 16px;
  padding: 0 0 0 12px;
  min-height: 30px !important;
}

.episode-count-input :deep(.v-btn) {
  width: 20px !important;
}
</style>
