<template>
  <div id="section">
    <div id="header">
      {{ listType | toTitleCase }}
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
      <watchlist-item
        v-for="item in items"
        :key="item.id"
        :parent-list="listType"
        :season-view="isSeasonView ? item : undefined"
        :show-season="isShowSeason ? item : undefined"
        :show-info="isShowInfo ? item : undefined"
      />
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import WatchlistItem from '@/components/Watchlist/WatchlistItem.vue'
import {
  SeasonView,
  ShowInfo,
  ShowSeason
} from '@/types/watchlistTypes'

export default Vue.extend({
  name: 'WatchlistSection',
  components: {
    watchlistItem: WatchlistItem,
  },
  props: {
    listType: {
      type: String,
      required: true,
    },
    items: {
      type: Array as PropType<SeasonView[] | ShowSeason[] | ShowInfo[]>,
      required: true,
    },
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
  },
  methods: {
    addItem() {
      this.$emit('add-item')
    },
  },
});
</script>

<style>
#section {
  flex-grow: 1;
  margin: 10px;
  border-radius: 10px;
  text-align: left;
  background-color: #defb;
  overflow: hidden;
}
#header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  font-size: 2em;
  background-color: #8bca;
}
#item-list {
  padding: 5px;
}
#add-button {
  padding: 6px;
  border: none;
  height: 36px;
  width: 36px;
}
</style>