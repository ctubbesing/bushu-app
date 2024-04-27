<template>
  <div id="section">
    <div id="header">
      <div id="header-title">
        <div> {{ listType | toTitleCase }} </div>
        <div> {{ items.length + ' item' + (items.length === 1 ? '' : 's') }} </div>
      </div>
      <b-button
        id="add-button"
        variant="outline-light"
        pill
        @click="addItem()"
      >
        <b-icon
          icon="plus"
          variant="secondary"
          font-scale="1.5"
        />
      </b-button>
    </div>
    <div id="item-list">
      <draggable
        v-model="items"
        :group="listType"
        handle=".drag-handle"
        :disabled="!isReorderable"
        v-bind="dragOptions"
        @change="onReorder"
      >
        <transition-group type="transition">
          <watchlist-item
            v-for="(item, idx) in items"
            :key="item.id"
            :parent-list="listType"
            :season-view="isSeasonView ? item : undefined"
            :show-season="isShowSeason ? item : undefined"
            :show-info="isShowInfo ? item : undefined"
            :is-reorderable="isReorderable"
            @mark-completed="$emit('mark-item-completed', item.id, listType)"
            @promote-item="$emit('promote-item', item.id, listType, $event)"
            @demote-item="$emit('demote-item', item.id, listType)"
            @remove-item="$emit('remove-item', item.id, listType)"
            @season-view-updated="updateSeasonView(idx, $event)"
          />
        </transition-group>
      </draggable>
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import WatchlistItem from '@/components/Watchlist/WatchlistItem.vue'
import tools from '@/utils/tools'
import Draggable from 'vuedraggable'
import {
  SeasonView,
  ShowInfo,
  ShowSeason
} from '@/types/watchlistTypes'

export default Vue.extend({
  name: 'WatchlistSection',
  components: {
    watchlistItem: WatchlistItem,
    draggable: Draggable,
  },
  props: {
    listType: {
      type: String,
      required: true,
    },
    value: {
      type: Array as PropType<SeasonView[] | ShowSeason[] | ShowInfo[]>,
      required: true,
    },
  },
  data() {
    return {
      items: [] as SeasonView[] | ShowSeason[] | ShowInfo[],
      dragOptions: {
        animation: 200,
        ghostClass: 'drag-ghost',
      }
    }
  },
  computed: {
    isSeasonView(): boolean {
      return this.listType === 'main' ||
             this.listType === 'live' ||
             this.listType === 'queue'
    },
    isShowSeason(): boolean {
      return this.listType === 'upcoming'
    },
    isShowInfo(): boolean {
      return this.listType === 'backlog'
    },
    isReorderable(): boolean {
      return this.listType === 'queue' || this.listType === 'backlog'
    },
  },
  watch: {
    value() {
      this.loadValue()
    },
  },
  created() {
    this.loadValue()
  },
  methods: {
    loadValue() {
      this.items = tools.deepClone(this.value)
    },
    syncModel() {
      this.$emit('input', this.items)
    },
    onReorder() {
      this.syncModel()
      this.$emit('reorder')
    },
    addItem() {
      this.$emit('add-item')
    },
    updateSeasonView(itemIdx: number, seasonView: SeasonView) {
      if (this.isSeasonView) {
        this.items[itemIdx] = seasonView
        this.syncModel()
      }
    },
  },
});
</script>

<style scoped>
#section {
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
#add-button {
  padding: 6px;
  border: none;
  height: 36px;
  width: 36px;
}
#full-item:last-child {
  margin-bottom: 0;
}
.drag-ghost {
  opacity: 0.5;
}

@media (min-width: 992px) {
  #item-list {
  overflow-y: auto;
  height: 100%;
}
}
</style>