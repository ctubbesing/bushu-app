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
            @mark-item-completed="showMarkCompletedOptions"
          />
          <watchlist-section
            :list-type="'live'"
            :items="watchlist.live"
            @add-item="selectCatalogEntry('live')"
            @mark-item-completed="showMarkCompletedOptions"
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
    </div>
    <catalog-modal
      id="catalogModal"
      :selection-target-list="targetListName"
      @item-selected="addCatalogItemToList"
      @hidden="onCatalogClose()"
    />
    <b-modal
      id="markCompletedModal"
      title="Marking Season Completed"
      size="md"
      centered
      ok-title="Confirm"
      @ok="markSeasonCompleted"
    >
      <watchlist-item
        parent-list="main"
        :season-view="markingCompletedSeasonView"
        :is-read-only="true"
      />
      <ul id="mark-completed-options">
        <li
          v-if="markingCompletedNextShowSeason"
          :class="{ 'selected': doNextSeasonToQueue }"
          @click.prevent="doNextSeasonToQueue = !doNextSeasonToQueue"
        >
          <b-form-checkbox v-model="doNextSeasonToQueue">
            Add next season to Queue:
          </b-form-checkbox>
          <watchlist-item
            :show-season="markingCompletedNextShowSeason"
            :is-read-only="true"
          />
        </li>
        <li
          v-if="markingCompletedNextQueueItem"
          :class="{ 'selected': doPopQueueToMain }"
          @click.prevent="doPopQueueToMain = !doPopQueueToMain"
        >
          <b-form-checkbox v-model="doPopQueueToMain">
            Move next item from Queue to Main:
          </b-form-checkbox>
          <watchlist-item
            :season-view="markingCompletedNextQueueItem"
            :is-read-only="true"
          />
        </li>
      </ul>
    </b-modal>
  </div>
</template>

<script lang="ts">
import watchlistService from '@/utils/services/WatchlistService'
import CatalogModal from '@/components/Watchlist/CatalogModal.vue'
import WatchlistSection from '@/components/Watchlist/WatchlistSection.vue'
import WatchlistItem from '@/components/Watchlist/WatchlistItem.vue'
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
    watchlistItem: WatchlistItem,
  },
  data() {
    return {
      watchlist: null as WatchlistData | null,
      isLoading: false as boolean,
      targetListName: null as string | null,
      markingCompletedSeasonView: null as SeasonView | null,
      markingCompletedNextShowSeason: null as ShowSeason | null,
      markingCompletedNextQueueItem: null as SeasonView | null,
      markingCompletedSourceList: '' as string,
      doNextSeasonToQueue: true as boolean,
      doPopQueueToMain: true as boolean,
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
    showMarkCompletedOptions(seasonViewId: string, sourceList: string) {
      this.markingCompletedSourceList = sourceList
      if (this.watchlist) {
        if (sourceList === 'main') {
          let seasonViewIdx = this.watchlist.main.findIndex((view: SeasonView) => view.id === seasonViewId)
          if (seasonViewIdx !== -1) {
            this.doNextSeasonToQueue = false
            this.doPopQueueToMain = false
            this.markingCompletedSeasonView = this.watchlist.main[seasonViewIdx]

            // find next season of show, if any
            this.markingCompletedNextShowSeason = null
            const seasonInfo = this.markingCompletedSeasonView.seasonInfo
            const seasonShowInfo: ShowInfo = this.$store.getters.getShowInfoById(seasonInfo.showId)
            let seasonIdx = seasonShowInfo.seasons.findIndex((season: ShowSeason) => season.id === seasonInfo.id)
            if (seasonIdx < seasonShowInfo.seasons.length - 1) {
              this.markingCompletedNextShowSeason = seasonShowInfo.seasons[seasonIdx + 1]
              this.doNextSeasonToQueue = true
            }

            // find next item in Queue, if any
            this.markingCompletedNextQueueItem = null
            if (this.watchlist.queue.length > 0) {
              this.markingCompletedNextQueueItem = this.watchlist.queue[0]
              this.doPopQueueToMain = true
            }

            this.$bvModal.show('markCompletedModal')
          }
        } else if (sourceList === 'live') {
          let seasonViewIdx = this.watchlist.live.findIndex((view: SeasonView) => view.id === seasonViewId)
          if (seasonViewIdx !== -1) {
            this.doNextSeasonToQueue = false
            this.doPopQueueToMain = false
            this.markingCompletedNextShowSeason = null
            this.markingCompletedNextQueueItem = null

            this.markingCompletedSeasonView = this.watchlist.live[seasonViewIdx]

            this.$bvModal.show('markCompletedModal')
          }
        }
      }
    },
    async markSeasonCompleted() {
      if (this.watchlist && this.markingCompletedSeasonView) {
        // set date completed, save, & remove from source list
        // TODO: eventually should move completed SVs to new save file but for now this works fine
        this.markingCompletedSeasonView.completedDate = (new Date()).toISOString()
        await watchlistService.SaveSeasonViews([ this.markingCompletedSeasonView ])

        if (this.markingCompletedSourceList === 'main' || this.markingCompletedSourceList === 'live') {
          const completedViewId = this.markingCompletedSeasonView.id
          const completedViewIdx = this.watchlist[this.markingCompletedSourceList].findIndex((view: SeasonView) => view.id === completedViewId)
          if (completedViewIdx !== -1) {
            this.watchlist[this.markingCompletedSourceList].splice(completedViewIdx, 1)
          }
        }

        if (this.doNextSeasonToQueue) {
          if (this.markingCompletedNextShowSeason) {
            const newSeasonView: SeasonView = {
              id: tools.getGUID(),
              seasonInfo: this.markingCompletedNextShowSeason,
              watchedEpisodes: 0,
              isDropped: false,
            }
            this.watchlist.queue.push(newSeasonView)
          }
        }

        if (this.doPopQueueToMain) {
          if (this.markingCompletedNextQueueItem) {
            this.watchlist.main.push(this.markingCompletedNextQueueItem)
            this.watchlist.queue.splice(0, 1)
          }
        }

        await this.saveWatchlist()
        this.markingCompletedSeasonView = null
      }
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
#mark-completed-options {
  padding: 0;
  margin: 0;
}
#mark-completed-options * {
  cursor: pointer;
}
#mark-completed-options > li {
  padding: 5px;
  margin: 5px 0;
  border: 1px solid #aaa;
  list-style: none;
  border-radius: 3px;
  list-style-position: inside;
  cursor: pointer;
}
#mark-completed-options > li.selected {
  border: 1px solid #007bff;
  color: #007bff;
  background-color: hsl(211, 80%, 90%);
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