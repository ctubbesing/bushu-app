<template>
  <div id="section">
    <div id="header">
      <div id="header-title">
        <div> {{ listType }} </div>
        <div> {{ `${itemCount} item${itemCount === 1 ? '' : 's'}` }} </div>
      </div>
      <v-btn
        icon="mdi-plus"
        variant="tonal"
        @click="emit('add-item')"
      />
    </div>
    <div id="item-list">
      <template v-if="itemType === 'seasonView' && seasonViews">
        <WatchlistItem
          v-for="(seasonView, idx) in seasonViews"
          :key="seasonView.id"
          v-model="seasonViews[idx]"
          :parent-list="listType"
          :is-reorderable="canResequence"
          @mark-completed="emit('mark-item-completed', seasonView.id, listType)"
          @promote-item="emit('promote-item', seasonView.id, listType, $event)"
          @demote-item="emit('demote-item', seasonView.id, listType)"
          @remove-item="emit('remove-item', seasonView.id, listType)"
          @irregular-seasons-updated="emit('irregular-seasons-updated')"
        />
      </template>
      <template v-else-if="itemType === 'season' && seasons">
        <WatchlistItem
          v-for="season in seasons"
          :key="season.id"
          :show-season="season"
          :parent-list="listType"
          :is-reorderable="canResequence"
          @promote-item="emit('promote-item', season.id, listType, $event)"
          @remove-item="emit('remove-item', season.id, listType)"
          @irregular-seasons-updated="emit('irregular-seasons-updated')"
        />
      </template>
      <template v-else-if="itemType === 'show' && shows">
        <WatchlistItem
          v-for="show in shows"
          :key="show.id"
          :show-info="show"
          :parent-list="listType"
          :is-reorderable="canResequence"
          @promote-item="emit('promote-item', show.id, listType, $event)"
          @remove-item="emit('remove-item', show.id, listType)"
          @irregular-seasons-updated="emit('irregular-seasons-updated')"
        />
      </template>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ListType, SeasonView, type ShowInfo, type ShowSeason } from '@/types/watchlistTypes'
import WatchlistItem from './WatchlistItem.vue'
import { computed } from 'vue'

const seasonViews = defineModel<SeasonView[]>('seasonViews')
const seasons = defineModel<ShowSeason[]>('seasons')
const shows = defineModel<ShowInfo[]>('shows')

const props = defineProps<{
  listType: ListType,
}>()

const emit = defineEmits<{
  'add-item': [],
  'mark-item-completed': [id: string, sourceList: ListType],
  'promote-item': [id: string, sourceList: ListType, targetList: ListType | undefined],
  'demote-item': [id: string, sourceList: ListType],
  'remove-item': [id: string, sourceList: ListType],
  'irregular-seasons-updated': [],
}>()

type WatchlistItemType = 'show' | 'season' | 'seasonView' | 'error'
const itemType = computed((): WatchlistItemType => {
  switch (props.listType) {
    case 'Main':
    case 'Live':
    case 'Queue':
      return seasonViews.value ? 'seasonView' : 'error'
    case 'Upcoming':
      return seasons.value ? 'season' : 'error'
    case 'Backlog':
      return shows.value ? 'show' : 'error'
    default:
      return 'error'
  }
})

const canResequence = computed((): boolean => {
  return props.listType === ListType.enum.Queue ||
    props.listType === ListType.enum.Backlog
})

const itemCount = computed((): number => (seasonViews.value ?? seasons.value ?? shows.value ?? []).length)
</script>

<style scoped>
#section {
  margin-bottom: 10px;
  border-radius: 10px;
  text-align: left;
  background-color: #fff5;
}
#header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background-color: #8bca;
  border-radius: 10px 10px 0 0;
}
#header-title > div:first-child {
  font-size: 2em;
}
#header-title > div:last-child {
  margin: -10px 0 0;
  font-size: 0.75em;
}
#item-list {
  padding: 5px;
}
#item-list::-webkit-scrollbar {
  width: 14px;
}
#item-list::-webkit-scrollbar-thumb {
  border: 4px solid #0000;
  background-clip: padding-box;
  border-radius: 7px;
  background-color: #0003;
}
</style>
