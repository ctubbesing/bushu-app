<template>
  <div id="section">
    <div id="header">
      <div id="header-title">
        <div> {{ listType }} </div>
        <div> {{ `${items.length} item${items.length === 1 ? '' : 's'}` }} </div>
      </div>
      <v-btn
        icon="mdi-plus"
        @click="emit('add-item')"
      />
    </div>
    <div id="item-list">
      <WatchlistItem
        v-for="item in items"
        :key="item.id"
        :parent-list="listType"
        :season-view="isSeasonView ? item : undefined"
        :show-season="isShowSeason ? item : undefined"
        :show-info="isShowInfo ? item : undefined"
        :is-reorderable="canResequence"
        @mark-completed="emit('mark-item-completed', item.id, listType)"
        @promote-item="emit('promote-item', item.id, listType, $event)"
        @demote-item="emit('demote-item', item.id, listType)"
        @remove-item="emit('remove-item', item.id, listType)"
        @irregular-seasons-updated="emit('irregular-seasons-updated')"
        />
        <!-- /////// ^^^^^^^ WLItm needs to be made generic to accept SV/SS/SI - might take a lot of work -->
        <!-- ///////// vvvvvvvvv also this emit from WLItm is dumb - instead, the generic WLItm should v-model `item` -->
        <!-- @season-view-updated="updateSeasonView(idx, $event)" -->
    </div>
  </div>
</template>

<script lang="ts" setup generic="T extends SeasonView | ShowSeason | ShowInfo">
import { ListType, SeasonView, type ShowInfo, type ShowSeason } from '@/types/watchlistTypes'
import toTitleCase from '@/utils/toTitleCase' ////////////////////////////// prolly don't need anymore
import WatchlistItem from './WatchlistItem.vue'
import { computed } from 'vue'

const items = defineModel<T[]>({ required: true })

const props = defineProps<{
  listType: ListType,
}>()

const emit = defineEmits<{
  'add-item': [],
  'mark-item-completed': [id: string, sourceList: string],
  'promote-item': [id: string, sourceList: string, targetList: string],
  'demote-item': [id: string, sourceList: string],
  'remove-item': [id: string, sourceList: string],
  'irregular-seasons-updated': [],
}>()

const canResequence = computed((): boolean => {
  return props.listType === ListType.enum.Queue ||
    props.listType === ListType.enum.Backlog
})

//////////////////////////////////////// this is messy & unnecessary vvvvvvvvvvvvvvvv
/////////////////////////// instead, WLItm should be generic and v-model each element of items
// const updateSeasonView = (itemIdx: number, seasonView: T) => {
//   items.value[itemIdx] = seasonView
// }
</script>
