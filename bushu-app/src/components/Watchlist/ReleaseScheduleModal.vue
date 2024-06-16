<template>
  <div>
    <b-modal
      :id="`release-schedule-modal-${seasonViewId}`"
      title="Projected Release Schedule"
      centered
      ok-title="Done"
      ok-variant="outline-primary"
      ok-only
    >
      <slot name="item-info"></slot>
      <div id="schedule-notes">
        <div>
          This is only a projection. Manually adjust the date of any episode to update the schedule.
        </div>
      </div>
      <table id="release-schedule-table">
        <thead>
          <tr>
            <th style="width: 35%"> Episode </th>
            <th style="width: 65%"> Date </th>
          </tr>
        </thead>
        <tbody>
          <div
            v-if="isLoading"
            class="loading-cover"
          >
            <b-spinner variant="light" />
          </div>
          <tr
            v-for="episodeDate in releaseSchedule"
            :key="episodeDate.episode"
            :class="{
              'released-episode': episodeDate.episode <= availableEpisodeCount,
              'latest-episode': episodeDate.episode === availableEpisodeCount,
            }"
          >
            <td> {{ episodeDate.episode }} </td>
            <td>
              <div
                v-if="episodeDate.episode === editingEpisode"
                class="date-editor"
              >
                <div
                  v-if="conflictingIrregularEpisodes.length > 0"
                  class="invalid-entry-message"
                >
                  This conflicts with other episode dates.
                </div>
                <b-form-datepicker
                  v-model="editingDate"
                  :min="showSeason.startDate"
                  size="sm"
                  style="margin: 2px 0"
                  :state="datePickerState"
                />
                <div>
                  <b-button
                    variant="secondary"
                    size="sm"
                    :disabled="isLoading"
                    @click="closeDateEditor()"
                  >
                    Cancel
                  </b-button>
                  <b-button
                    variant="warning"
                    size="sm"
                    :disabled="!isEditingDateIrregular || isLoading"
                    @click="setIrregularDate(true)"
                  >
                    Reset
                  </b-button>
                  <b-button
                    variant="primary"
                    size="sm"
                    :disabled="!isEditingDateChanged || isLoading || conflictingIrregularEpisodes.length > 0"
                    @click="setIrregularDate()"
                  >
                    Save
                  </b-button>
                </div>
              </div>
              <div
                v-else
                :class="[
                  'schedule-date',
                  {
                    'irregular-date': isIrregularlyScheduledEpisode(episodeDate.episode),
                    'invalid-date': isConflictingIrregularDate(episodeDate.episode),
                    'clickable': !isLoading && episodeDate.episode !== 1,
                  }
                ]"
                @click="editEpisodeDate(episodeDate)"
              >
                {{ formatReleaseDate(episodeDate.date) }}
              </div>
            </td>
          </tr>
          <tr
            v-if="showSeason.totalEpisodeCount == undefined"
            style="background-color: #0001; font-size: 0.7em; color: #0008"
          >
            <td colspan="2">
              <div style="padding: 2px">
                <span style="margin-right: 2px">
                  <b-icon icon="exclamation-circle" />
                </span>
                The number of episodes shown may be inaccurate because the total episode count for this season is unset.
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </b-modal>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { DateTime } from 'luxon'
import { ShowSeason, EpisodeDate, RawEpisodeDate } from '@/types/watchlistTypes'
import tools from '@/utils/tools';

export default Vue.extend({
  name: 'ReleaseScheduleModal',
  props: {
    releaseSchedule: {
      type: Array as PropType<EpisodeDate[]>,
      required: true,
    },
    showSeason: {
      type: Object as PropType<ShowSeason>,
      required: true,
    },
    availableEpisodeCount: {
      type: Number,
      required: true,
    },
    seasonViewId: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      editingEpisode: -1 as number,
      editingDate: '' as string,
    };
  },
  computed: {
    datePickerState(): boolean | null {
      if (this.conflictingIrregularEpisodes.length > 0) {
        return false
      }
      if (this.editingEpisode > 0 && this.isIrregularlyScheduledEpisode(this.editingEpisode)) {
        return true
      }
      return null
    },
    isEditingDateChanged(): boolean {
      return this.editingEpisode > 0 &&
             this.releaseSchedule[this.editingEpisode - 1].date.toISODate() !== this.editingDate
    },
    isEditingDateIrregular(): boolean {
      return this.editingEpisode > 0 &&
             this.isIrregularlyScheduledEpisode(this.editingEpisode)
    },
    isLoading(): boolean {
      return this.$store.state.watchlist.isUpdatingSeason
    },
    conflictingIrregularEpisodes(): number[] {
      if (this.editingEpisode > 0 && this.showSeason.irregularDates) {
        return this.showSeason.irregularDates
          .filter((d: RawEpisodeDate) => {
            return (d.episode < this.editingEpisode && d.date > this.editingDate) ||
                   (d.episode > this.editingEpisode && d.date < this.editingDate)
          })
          .map((d: RawEpisodeDate) => d.episode)
      }
      return []
    },
  },
  methods: {
    formatReleaseDate(date: DateTime) {
      return date.toFormat('EEEE, M/d/yyyy')
    },
    isIrregularlyScheduledEpisode(episodeNumber: number): boolean {
      return this.showSeason.irregularDates?.some((d: RawEpisodeDate) => d.episode === episodeNumber) ?? false
    },
    isConflictingIrregularDate(episodeNumber: number): boolean {
      return this.conflictingIrregularEpisodes.includes(episodeNumber)
    },
    editEpisodeDate(episodeDate: EpisodeDate) {
      if (!this.isLoading && episodeDate.episode !== 1) {
        this.editingEpisode = episodeDate.episode
        this.editingDate = episodeDate.date.toISODate()
      }
    },
    closeDateEditor() {
      this.editingEpisode = -1
    },
    async setIrregularDate(doReset = false) {
      if (!this.isLoading) {
        let updatedSeason: ShowSeason = tools.deepClone(this.showSeason)
        let irregularDates: RawEpisodeDate[] = updatedSeason.irregularDates ?? []
        let updatedDateIdx = irregularDates.findIndex((d: RawEpisodeDate) => d.episode === this.editingEpisode)
        if (updatedDateIdx === -1) {
          irregularDates.push({
            episode: this.editingEpisode,
            date: this.editingDate
          })
        } else {
          if (doReset) {
            irregularDates.splice(updatedDateIdx, 1)
          } else {
            irregularDates[updatedDateIdx].date = this.editingDate
          }
        }
        irregularDates.sort((a: RawEpisodeDate, b: RawEpisodeDate) => a.episode - b.episode)

        updatedSeason.irregularDates = irregularDates

        await this.updateShowSeason(updatedSeason)
        this.$emit('irregular-seasons-updated')

        this.closeDateEditor()
      }
    },
    async updateShowSeason(updatedSeason: ShowSeason) {
      await this.$store.dispatch('updateCatalogShowSeason', updatedSeason)
    }
  },
});
</script>

<style scoped>
#release-schedule-table {
  width: 100%;
  background-color: #defb;
  border-radius: 8px;
  text-align: center;
}
#release-schedule-table > tbody {
  position: relative;
}
#release-schedule-table > tbody > tr {
  height: 30px;
  border-bottom: 1px solid #0001;
}
#release-schedule-table tr.released-episode {
  background-color: #0002;
}
#release-schedule-table tr.latest-episode {
  border-bottom: 2px solid hsl(210, 60%, 60%, 0.5);
}
#release-schedule-table > tbody > tr:last-child {
  border-bottom: none;
}
#release-schedule-table .schedule-date {
  width: 80%;
  margin: 2px auto;
  padding: 3px;
  border-radius: 3px;
  border: 2px solid hsl(210, 60%, 60%, 0.3);
  background-color: hsl(210, 60%, 60%, 0.3);
  cursor: pointer;
}
#release-schedule-table .schedule-date.irregular-date {
  border: 4px solid hsl(210, 30%, 40%, 0.5);
  color: #555;
  font-style: italic;
}
#release-schedule-table .schedule-date.invalid-date {
  border: 4px solid hsla(0, 30%, 40%, 0.5);
  background-color: hsl(0, 60%, 60%, 0.3);
}
#release-schedule-table .schedule-date.clickable:hover {
  background-color: hsl(210, 60%, 60%, 0.5);
}
.date-editor {
  position: relative;
  margin: 3px;
}
.date-editor > div {
  display: flex;
  justify-content: space-around;
}
.loading-cover {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
  border-radius: 0 0 8px 8px;
  background-color: #0004;
  z-index: 100;
}
.invalid-entry-message {
  color: hsl(0, 71%, 40%);
  font-size: 0.7rem;
  font-weight: bold;
}
</style>
