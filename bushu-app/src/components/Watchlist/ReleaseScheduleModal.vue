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
          <tr
            v-for="episode in releaseSchedule"
            :key="episode.episodeNumber"
            :class="{
              'released-episode': episode.episodeNumber <= availableEpisodeCount,
              'latest-episode': episode.episodeNumber === availableEpisodeCount,
            }"
          >
            <td> {{ episode.episodeNumber }} </td>
            <td>
              <div class="schedule-date">
                {{ formatReleaseDate(episode.date) }}
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
import { ShowSeason } from '@/types/watchlistTypes'

export default Vue.extend({
  name: 'ReleaseScheduleModal',
  props: {
    releaseSchedule: {
      type: Array as PropType<{ episodeNumber: number, date: DateTime }[]>,
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
    return {};
  },
  computed: {},
  methods: {
    formatReleaseDate(date: DateTime) {
      return date.toFormat('EEEE, M/d/yyyy')
    },
  },
});
</script>

<style scoped>
#release-schedule-table {
  width: 100%;
  background-color: #defb;
  border-radius: 8px;
  text-align: center;
  overflow: hidden;
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
#release-schedule-table .schedule-date:hover {
  background-color: hsl(210, 60%, 60%, 0.5);
}
</style>