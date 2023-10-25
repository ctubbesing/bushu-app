<template>
  <div>
    <div
      v-if="watchlist"
      id="all-sections-container"
    >
      <div id="active-sections-container">
        <div
          id="currently-watching-section"
          class="temp-currently-watching-section"
        >
          Currently Watching <br>
        </div>
        <div id="main-live-container">
          <watchlist-section
            :list-type="'main'"
            :items="watchlist.main"
            @add-item="selectCatalogEntry('main')"
          />
          <watchlist-section
            :list-type="'live'"
            :items="watchlist.live"
            @add-item="selectCatalogEntry('live')"
          />
        </div>
      </div>
      <div id="inactive-sections-container">
        <watchlist-section
          :list-type="'queue'"
          :items="watchlist.queue"
          @add-item="selectCatalogEntry('queue')"
        />
        <watchlist-section
          :list-type="'upcoming'"
          :items="watchlist.upcoming"
          @add-item="selectCatalogEntry('upcoming')"
        />
        <watchlist-section
          :list-type="'backlog'"
          :items="watchlist.backlog"
          @add-item="selectCatalogEntry('backlog')"
        />
      </div>
    </div>
    <div>
      <b-button @click="openCatalog()">View Catalog</b-button>
      <b-button
        @click="saveWatchlist()"
        :disabled="isLoading"
      >
        Save
      </b-button>
    </div>
    <catalog-modal
      id="catalogModal"
      :selection-target-list="targetListName"
      @item-selected="addCatalogItemToList"
      @hidden="onCatalogClose()"
    />
  </div>
</template>

<script lang="ts">
import watchlistService from '@/utils/services/WatchlistService'
import CatalogModal from '@/components/Watchlist/CatalogModal.vue'
import WatchlistSection from '@/components/Watchlist/WatchlistSection.vue'
import {
  SeasonView,
  ShowInfo,
  ShowSeason,
  WatchlistData,
} from '@/types/watchlistTypes'
import Vue from "vue";
import tools from '@/utils/tools';

export default Vue.extend({
  name: "Watchlist",
  components: {
    catalogModal: CatalogModal,
    watchlistSection: WatchlistSection,
  },
  data() {
    return {
      watchlist: null as WatchlistData | null,
      isLoading: false as boolean,
      targetListName: null as string | null,
    };
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
    await this.loadData()
  },
  methods: {
    async loadData() {
      if (this.isReady) {
        await this.$store.dispatch('loadCatalogFromDropbox')

        const catalog: ShowInfo[] = this.$store.state.watchlist.catalog
        await this.loadWatchlist()
      }
    },
    async loadWatchlist() {
      this.watchlist = await watchlistService.GetWatchlistData()
    },
    async saveWatchlist() {
      if (this.watchlist) {
        this.isLoading = true
        await watchlistService.SaveWatchlistData(this.watchlist)
        this.isLoading = false
      }
    },
    selectCatalogEntry(targetListName: string) {
      this.targetListName = targetListName
      this.openCatalog()
    },
    async addCatalogItemToList(item: ShowInfo | ShowSeason, targetListName: string) {
      if (this.watchlist) {
        if (targetListName === 'main' || targetListName === 'live' || targetListName === 'queue') {
          let newSeasonView: SeasonView = {
            id: tools.getGUID(),
            seasonInfo: item as ShowSeason,
            watchedEpisodes: 0,
            isDropped: false,
          }
          this.watchlist[targetListName].push(newSeasonView)
        } else if (targetListName === 'upcoming') {
          this.watchlist.upcoming.push(item as ShowSeason)
        } else if (targetListName === 'backlog') {
          this.watchlist.backlog.push(item as ShowInfo)
        }
      }
      this.closeCatalog()
      await this.saveWatchlist()
    },
    openCatalog() {
      this.$bvModal.show('catalogModal')
    },
    closeCatalog() {
      this.$bvModal.hide('catalogModal')
    },
    onCatalogClose() {
      this.targetListName = null
    },
  },
});
</script>

<style>
#all-sections-container {
  display: flex;
  height: 90vh;
}
#active-sections-container {
  display: flex;
  flex-direction: column;
  width: 70%;
}
#currently-watching-section {
  flex-grow: 5;
}
#main-live-container {
  flex-grow: 2;
  display: flex;
}
.temp-currently-watching-section {
  flex-grow: 1;
  margin: 10px;
  border-radius: 10px;
  padding: 10px;
  text-align: left;
  background-color: #defb;
}
#main-list {}
#live-list {}
#inactive-sections-container {
  display: flex;
  flex-direction: column;
  width: 30%;
}
#queue-list {}
#upcoming-list {}
#backlog-list {
  flex-grow: 0.6;
}

@media (max-width: 991.99px) {
  #all-sections-container {
    display: block;
    height: auto;
  }
  #active-sections-container {
    display: block;
    width: 100%;
  }
  #main-live-container {
    display: block;
  }
  #inactive-sections-container {
    display: block;
    width: 100%;
  }
}
</style>