<template>
  <div>
    <scroll-to-refresh
      :is-loading="isLoading"
      @refresh="handleRefresh"
    />
    <div
      id="all-sections-container"
    >
      <!-- class="p2" -->
      <!-- v-if="readingList" -->
      <div id="buttons-container">
        <icon-button
          :icon="'book'"
          @click="openLibrary()"
        />
      </div>
      <h2>Reading List</h2>
    </div>
    <!-- Library Modal -->
    <library-modal
      id="libraryModal"
    />
      <!-- :selection-target-list="targetListName"
      @item-selected="addCatalogItemToList"
      @hidden="resetTargets()" -->
  </div>
</template>

<script lang="ts">
import Vue from "vue"
import { BvModalEvent } from 'bootstrap-vue'
import {
  Collection,
  Series,
  Book,
  ReadingListData,
} from '@/types/readingListTypes'
import tools from '@/utils/tools';
import ScrollToRefresh from '@/components/utils/ScrollToRefresh.vue'
import LibraryModal from '@/components/ReadingList/LibraryModal.vue'
// import watchlistService from '@/utils/services/WatchlistService'
import IconButton from '@/components/utils/IconButton.vue'
// import WatchlistItem from '@/components/Watchlist/WatchlistItem.vue'
// import WatchlistSection from '@/components/Watchlist/WatchlistSection.vue'

export default Vue.extend({
  name: "ReadingList",
  components: {
    libraryModal: LibraryModal,
    iconButton: IconButton,
    scrollToRefresh: ScrollToRefresh,
  },
  data() {
    return {
      readingList: null as ReadingListData | null,
      isLoading: false as boolean,
    }
  },
  computed: {
    isReady(): boolean {
      return this.$store.getters.db_isReady
    },
  },
  watch: {
    async isReady(isReady: boolean) {
      if (isReady) {
        await this.loadData()
      }
    },
  },
  async created() {
    if (this.isReady) {
      await this.loadData()
    }
  },
  methods: {
    async loadData(doForceReload = false) {
      this.isLoading = true

      // await this.$store.dispatch('loadCatalogFromDropbox')
      // await this.loadWatchlist(doForceReload)

      this.isLoading = false
    },
    // async loadWatchlist(doForceReload = false) {
    //   this.watchlist = await watchlistService.GetWatchlistData(doForceReload)
    // },
    // async saveWatchlist() {
    //   if (this.watchlist) {
    //     await watchlistService.SaveWatchlistData(this.watchlist)
    //   }
    // },
    async handleRefresh() {
      this.isLoading = true

      // await watchlistService.ForceSaveSeasonViews()
      await this.loadData(true)

      this.isLoading = false
    },
    openLibrary() {
      this.$bvModal.show('libraryModal')
    },
    closeLibrary() {
      this.$bvModal.hide('libraryModal')
    },
  },
});
</script>

<style scoped>
</style>
