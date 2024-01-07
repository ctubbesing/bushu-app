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
      <watchlist-item
        v-for="item in items"
        :key="item.id"
        :parent-list="listType"
        :season-view="isSeasonView ? item : undefined"
        :show-season="isShowSeason ? item : undefined"
        :show-info="isShowInfo ? item : undefined"
        @mark-completed="$emit('mark-item-completed', item.id, listType)"
        @remove-item="$emit('remove-item', item.id, listType)"
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

@media (min-width: 992px) {
  #item-list {
  overflow-y: auto;
  height: 100%;
}
}
</style>