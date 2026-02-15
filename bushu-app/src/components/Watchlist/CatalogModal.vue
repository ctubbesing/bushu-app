<template>
  <BaseModal
    v-model="showModal"
    title="Catalog"
  >
    <!-- :do-ok="true"
    :do-cancel="false" -->
    <div id="catalog-search">
      <v-text-field
        v-model="searchString"
        label="Search"
        variant="outlined"
        clearable
      />
    </div>
    <v-card
      variant="tonal"
      class="mt-2 pa-2"
    >
      <v-expansion-panels>
        <v-expansion-panel
          v-for="show in catalog"
          :key="show.id"
        >
          <template #title>
            <div
              class="d-flex w-100"
              style="height: 90px;"
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
          </template>
          <template #text>
            <v-list>
              <v-list-item
                v-for="season in show.seasons"
                :key="season.id"
                :title="season.name ?? `Season ${season.seasonNumber}`"
                :subtitle="season.totalEpisodeCount ? `${season.totalEpisodeCount} episodes` : undefined"
              />
            </v-list>
          </template>
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

const showModal = defineModel<boolean>()

const searchString = ref('')

const watchlistStore = useWatchlist()
const catalog = computed((): ShowInfo[] => watchlistStore.catalog)

onMounted(() => watchlistStore.loadCatalog())

const getTotalEpisodeCount = (show: ShowInfo): number => {
  return show.seasons.reduce((sum: number, s: ShowSeason) => {
    return sum + (s.totalEpisodeCount ? s.totalEpisodeCount : 0)
  }, 0)
}
</script>

<style scoped>
:deep(.v-expansion-panel-title) {
  padding: 8px;
}
</style>
