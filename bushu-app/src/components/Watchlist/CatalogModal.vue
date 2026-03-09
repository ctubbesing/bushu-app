<template>
  <BaseModal
    v-model="showModal"
    title="Catalog"
    title-icon="mdi-television-guide"
  >
    <template #subheader>
      <div id="catalog-search">
        <v-text-field
          v-model="searchString"
          label="Search"
          variant="outlined"
          clearable
        />
      </div>
    </template>
    <v-card
      variant="tonal"
      class="pa-2"
    >
      <v-expansion-panels>
        <v-expansion-panel
          v-for="show in filteredCatalog"
          :key="show.id"
          class="show-entry"
        >
          <v-expansion-panel-title>
            <template #actions="{ expanded, expandIcon, collapseIcon }">
              <div class="show-icons">
                <v-icon
                  icon="mdi-pencil"
                  color="app-gray"
                />
                <v-icon :icon=" expanded ? collapseIcon : expandIcon" />
              </div>
            </template>
            <div
              class="d-flex w-100"
              style="min-height: 90px;"
            >
              <ThumbnailImage
                :link="watchlistStore.getShowImageLink(show)"
                :colorSeed="show.id"
                :height="90"
                class="mr-2"
              />
              <div class="d-flex flex-column justify-space-between h-100">
                <div>
                  <h4>{{ show.title }}</h4>
                  <div
                    v-if="show.altTitle"
                    class="text-caption mt-n2"
                  >
                    {{ show.altTitle }}
                  </div>
                </div>
                <div v-if="show.seasonCount">
                  {{  tools.pluralFormat(show.seasonCount, 'season') }}
                </div>
                <div v-else>
                  {{ getTotalEpisodeCount(show) }} total episodes
                </div>
              </div>
            </div>
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <v-list
              rounded
              class="py-0 overflow-y-hidden"
            >
              <v-list-item
                v-for="(season, sznIdx) in show.seasons"
                :key="season.id"
                class="px-1 show-season"
              >
                <template #prepend>
                  <ThumbnailImage
                    v-if="show.seasons.some(s => s.imgLink)"
                    :link="getSeasonImageLink(show, sznIdx)"
                    :doFaded="!season.imgLink"
                    :colorSeed="season.id"
                    :height="80"
                    class="mr-2"
                  />
                </template>
                <div class="season-details">
                  <h5>
                    {{ `Season ${season.seasonNumber}` + (season.name ? `: ${season.name}` : '') }}
                  </h5>
                  <div style="display: flex; justify-content: space-between; align-items: flex-end">
                    <div>
                      <div v-if="season.totalEpisodeCount">
                        {{  tools.pluralFormat(season.totalEpisodeCount, 'episode') }}
                      </div>
                      <div v-if="season.startDate || season.endDate">
                        {{ formatDate(season.startDate) }}
                        <span v-if="season.startDate !== season.endDate">
                          - {{ formatDate(season.endDate) }}
                        </span>
                      </div>
                    </div>
                    <div
                      v-if="season.airingYear && season.airingSeason"
                    >
                      <b>{{ season.airingYear + ' ' + season.airingSeason }}</b>
                    </div>
                  </div>
                </div>
              </v-list-item>
            </v-list>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
    </v-card>
    {{ searchString }}
  </BaseModal>
</template>

<script lang="ts" setup>
import BaseModal from '@/components/utils/BaseModal.vue'
import { useWatchlist } from '@/stores/watchlist'
import type { ShowInfo, ShowSeason } from '@/types/watchlistTypes'
import { computed, onMounted, ref } from 'vue'
import ThumbnailImage from '../ThumbnailImage.vue'
import tools from '@/utils/tools'
import formatDate from '@/utils/formatDate'

const showModal = defineModel<boolean>()

const searchString = ref('')

const watchlistStore = useWatchlist()
const catalog = computed((): ShowInfo[] => watchlistStore.catalog)

const filteredCatalog = computed((): ShowInfo[] => {
  if (!searchString.value) {
    return catalog.value
  }

  return catalog.value.filter((s: ShowInfo) => {
    return s.title.toLowerCase().includes(searchString.value.toLowerCase())
  })
})

onMounted(() => watchlistStore.loadCatalog())

const getTotalEpisodeCount = (show: ShowInfo): number => {
  return show.seasons.reduce((sum: number, s: ShowSeason) => {
    return sum + (s.totalEpisodeCount ? s.totalEpisodeCount : 0)
  }, 0)
}

const getSeasonImageLink = (show: ShowInfo, sznIdx: number): string => {
  return show.seasons[sznIdx].imgLink ?? watchlistStore.getShowImageLink(show)
}
</script>

<style scoped>
:deep(.v-expansion-panel-title) {
  padding: 8px;
}
.show-entry {
  background-image:
    linear-gradient(to bottom, hsl(192, 71%, 85%) 110px, #0000),
    url('https://media.themoviedb.org/t/p/w1066_and_h600_face/3GQKYh6Trm8pxd2AypovoYQf4Ay.jpg');
  background-position: 50%;
  background-size: cover;
  background-color: hsl(192, 71%, 85%);
}
.show-entry:not(.v-expansion-panel--active) {
  background-image: linear-gradient(to bottom, hsl(192, 71%, 85%) 110px, #0000 80%);
}
.show-season:not(:last-child) {
  border-bottom: 1px solid #ccc;
}
.show-season {
  min-height: 80px;
  /* width: 90%; */
  background-color: hsl(192, 71%, 95%);
  font-size: 0.8em;
}
.season-details {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  width: 100%;
}
.show-icons {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 80px;
}
span.v-expansion-panel-title__icon {
  height: 100% !important;
}
</style>
