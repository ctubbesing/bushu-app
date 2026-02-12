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
          :title="show.title"
        >
          <template>
            asdfasdfasdf
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
import type { ShowInfo } from '@/types/watchlistTypes'
import { computed, onMounted, ref } from 'vue'

const showModal = defineModel<boolean>()

const searchString = ref('')

const watchlistStore = useWatchlist()
const catalog = computed((): ShowInfo[] => watchlistStore.catalog)

onMounted(() => watchlistStore.loadCatalog())
</script>

<style scoped>
</style>
