<template>
  <div>
    <div
      v-if="watchlist"
      id="all-sections-container"
    >
      <div id="buttons-container">
        <icon-button
          :icon="'collection'"
          @click="openCatalog()"
        />
      </div>
      <div id="active-sections-container">
        <div id="currently-watching-section">
          Currently Watching
        </div>
        <div id="main-live-container">
          <div id="main-list">
            <watchlist-section
              :list-type="'main'"
              :items="watchlist.main"
              @add-item="selectCatalogEntry('main')"
              @mark-item-completed="showMarkCompletedOptions"
              @demote-item="demoteItem"
              @remove-item="promptConfirmRemoveItem"
            />
          </div>
          <div id="live-list">
            <watchlist-section
              :list-type="'live'"
              :items="watchlist.live"
              @add-item="selectCatalogEntry('live')"
              @mark-item-completed="showMarkCompletedOptions"
              @remove-item="promptConfirmRemoveItem"
            />
          </div>
        </div>
      </div>
      <div id="inactive-sections-container">
        <div id="queue-list">
          <watchlist-section
            :list-type="'queue'"
            :items="watchlist.queue"
            @add-item="selectCatalogEntry('queue')"
            @promote-item="promoteItem"
            @remove-item="promptConfirmRemoveItem"
          />
        </div>
        <div id="upcoming-list">
          <watchlist-section
            :list-type="'upcoming'"
            :items="watchlist.upcoming"
            @add-item="selectCatalogEntry('upcoming')"
            @remove-item="promptConfirmRemoveItem"
          />
        </div>
        <div id="backlog-list">
          <watchlist-section
            :list-type="'backlog'"
            :items="watchlist.backlog"
            @add-item="selectCatalogEntry('backlog')"
            @promote-item="promoteItem"
            @remove-item="promptConfirmRemoveItem"
          />
        </div>
      </div>
    </div>
    <!-- Catalog Modal -->
    <catalog-modal
      id="catalogModal"
      :selection-target-list="targetListName"
      @item-selected="addCatalogItemToList"
      @hidden="resetTargets()"
    />
    <!-- Mark Completed Modal -->
    <b-modal
      id="markCompletedModal"
      title="Marking Season Completed"
      size="md"
      centered
      ok-title="Confirm"
      @ok="markSeasonCompleted"
      @hide="onModalHide"
    >
      <watchlist-item
        parent-list="main"
        :season-view="targetSeasonView"
        :is-read-only="true"
      />
      <ul id="mark-completed-options">
        <li
          v-if="targetShowSeason"
          :class="{ 'selected': doNextSeasonToQueue }"
          @click.prevent="doNextSeasonToQueue = !doNextSeasonToQueue"
        >
          <b-form-checkbox v-model="doNextSeasonToQueue">
            Add next season to Queue:
          </b-form-checkbox>
          <watchlist-item
            :show-season="targetShowSeason"
            :is-read-only="true"
          />
        </li>
        <li
          v-if="targetNextQueueItem"
          :class="{ 'selected': doPopQueueToMain }"
          @click.prevent="doPopQueueToMain = !doPopQueueToMain"
        >
          <b-form-checkbox v-model="doPopQueueToMain">
            Move next item from Queue to Main:
          </b-form-checkbox>
          <watchlist-item
            :season-view="targetNextQueueItem"
            :is-read-only="true"
          />
        </li>
      </ul>
    </b-modal>
    <!-- Confirm Drop Modal -->
    <b-modal
      id="confirmRemoveModal"
      :title="'Drop ' + (targetListName === 'backlog' ? 'show' : 'season') + '?'"
      size="md"
      centered
      ok-title="Confirm"
      ok-variant="danger"
      @ok="removeItem"
      @hide="onModalHide"
    >
      <watchlist-item
        :parent-list="targetListName"
        :season-view="targetSeasonView"
        :show-season="targetShowSeason"
        :show-info="targetShowInfo"
        :is-read-only="true"
      />
      The season will be {{ targetSeasonView ? 'marked as Dropped and' : '' }} removed from the {{ targetListName | toTitleCase}} list.
    </b-modal>
  </div>
</template>

<script lang="ts">
import watchlistService from '@/utils/services/WatchlistService'
import CatalogModal from '@/components/Watchlist/CatalogModal.vue'
import WatchlistSection from '@/components/Watchlist/WatchlistSection.vue'
import WatchlistItem from '@/components/Watchlist/WatchlistItem.vue'
import IconButton from '@/components/utils/IconButton.vue'
import {
  SeasonView,
  ShowInfo,
  ShowSeason,
  WatchlistData,
} from '@/types/watchlistTypes'
import Vue from "vue";
import tools from '@/utils/tools';
import { BvModalEvent } from 'bootstrap-vue'

export default Vue.extend({
  name: "Watchlist",
  components: {
    catalogModal: CatalogModal,
    watchlistSection: WatchlistSection,
    watchlistItem: WatchlistItem,
    iconButton: IconButton,
  },
  data() {
    return {
      watchlist: null as WatchlistData | null,
      isLoading: false as boolean,
      targetListName: null as string | null,
      targetSeasonView: null as SeasonView | null,
      targetShowSeason: null as ShowSeason | null,
      targetShowInfo: null as ShowInfo | null,
      targetNextQueueItem: null as SeasonView | null,
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
    resetTargets() {
      this.targetListName = null
      this.targetSeasonView = null
      this.targetShowSeason = null
      this.targetShowInfo = null
      this.targetNextQueueItem = null
    },
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
    selectCatalogEntry(listName: string) {
      this.targetListName = listName
      this.openCatalog()
    },
    async addCatalogItemToList(item: ShowInfo | ShowSeason, listName: string) {
      if (this.watchlist) {
        if (listName === 'main' || listName === 'live' || listName === 'queue') {
          let newSeasonView: SeasonView = {
            id: tools.getGUID(),
            seasonInfo: item as ShowSeason,
            watchedEpisodes: 0,
          }
          this.watchlist[listName].push(newSeasonView)
        } else if (listName === 'upcoming') {
          this.watchlist.upcoming.push(item as ShowSeason)
        } else if (listName === 'backlog') {
          this.watchlist.backlog.push(item as ShowInfo)
        }
      }
      this.closeCatalog()
      await this.saveWatchlist()
    },
    showMarkCompletedOptions(seasonViewId: string, sourceList: string) {
      this.targetListName = sourceList
      if (this.watchlist) {
        if (sourceList === 'main') {
          let seasonViewIdx = this.watchlist.main.findIndex((view: SeasonView) => view.id === seasonViewId)
          if (seasonViewIdx !== -1) {
            this.doNextSeasonToQueue = false
            this.doPopQueueToMain = false
            this.targetSeasonView = this.watchlist.main[seasonViewIdx]

            // find next season of show, if any
            this.targetShowSeason = null
            const seasonInfo = this.targetSeasonView.seasonInfo
            const seasonShowInfo: ShowInfo = this.$store.getters.getShowInfoById(seasonInfo.showId)
            let seasonIdx = seasonShowInfo.seasons.findIndex((season: ShowSeason) => season.id === seasonInfo.id)
            if (seasonIdx < seasonShowInfo.seasons.length - 1) {
              this.targetShowSeason = seasonShowInfo.seasons[seasonIdx + 1]
              this.doNextSeasonToQueue = true
            }

            // find next item in Queue, if any
            this.targetNextQueueItem = null
            if (this.watchlist.queue.length > 0) {
              this.targetNextQueueItem = this.watchlist.queue[0]
              this.doPopQueueToMain = true
            }

            this.$bvModal.show('markCompletedModal')
          }
        } else if (sourceList === 'live') {
          let seasonViewIdx = this.watchlist.live.findIndex((view: SeasonView) => view.id === seasonViewId)
          if (seasonViewIdx !== -1) {
            this.doNextSeasonToQueue = false
            this.doPopQueueToMain = false
            this.targetShowSeason = null
            this.targetNextQueueItem = null

            this.targetSeasonView = this.watchlist.live[seasonViewIdx]

            this.$bvModal.show('markCompletedModal')
          }
        }
      }
    },
    async markSeasonCompleted() {
      if (this.watchlist && this.targetSeasonView) {
        // set date completed, save, & remove from source list
        // TODO: eventually should move completed SVs to new save file but for now this works fine
        this.targetSeasonView.completedDate = (new Date()).toISOString()
        await watchlistService.SaveSeasonViews([ this.targetSeasonView ])

        if (this.targetListName === 'main' || this.targetListName === 'live') {
          const completedViewId = this.targetSeasonView.id
          const completedViewIdx = this.watchlist[this.targetListName].findIndex((view: SeasonView) => view.id === completedViewId)
          if (completedViewIdx !== -1) {
            this.watchlist[this.targetListName].splice(completedViewIdx, 1)
          }
        }

        if (this.doNextSeasonToQueue) {
          if (this.targetShowSeason) {
            const newSeasonView: SeasonView = {
              id: tools.getGUID(),
              seasonInfo: this.targetShowSeason,
              watchedEpisodes: 0,
            }
            this.watchlist.queue.push(newSeasonView)
          }
        }

        if (this.doPopQueueToMain) {
          if (this.targetNextQueueItem) {
            this.watchlist.main.push(this.targetNextQueueItem)
            this.watchlist.queue.splice(0, 1)
          }
        }

        await this.saveWatchlist()
      }
      this.resetTargets()
    },
    promptConfirmRemoveItem(itemId: string, sourceList: string) {
      this.targetListName = sourceList
      if (this.watchlist) {
        if (sourceList === 'main' || sourceList === 'live' || sourceList === 'queue') {
          let seasonViewIdx = this.watchlist[sourceList].findIndex((view: SeasonView) => view.id === itemId)
          this.targetSeasonView = this.watchlist[sourceList][seasonViewIdx]
        } else if (sourceList === 'upcoming') {
          let showSeasonIdx = this.watchlist.upcoming.findIndex((szn: ShowSeason) => szn.id === itemId)
          this.targetShowSeason = this.watchlist.upcoming[showSeasonIdx]
        } else if (sourceList === 'backlog') {
          let showInfoIdx = this.watchlist.backlog.findIndex((show: ShowInfo) => show.id === itemId)
          this.targetShowInfo = this.watchlist.backlog[showInfoIdx]
        }
        this.$bvModal.show('confirmRemoveModal')
      }
    },
    async promoteItem(itemId: string, sourceList: string) {
      if (this.watchlist) {
        if (sourceList === 'queue') {
          // promote Queued SeasonView to Main
          const seasonViewIdx = this.watchlist.queue.findIndex((view: SeasonView) => view.id === itemId)
          if (seasonViewIdx !== -1) {
            const promotedSeasonView = this.watchlist.queue[seasonViewIdx]
            this.watchlist.main.push(promotedSeasonView)
            this.watchlist.queue.splice(seasonViewIdx, 1)
          }
        } else if (sourceList === 'backlog') {
          // promote Backlog ShowInfo to Queue
          const showInfoIdx = this.watchlist.backlog.findIndex((show: ShowInfo) => show.id === itemId)
          if (showInfoIdx !== -1) {
            const promotedShow = this.watchlist.backlog[showInfoIdx]
            if (promotedShow.seasons.length > 0) {
              const showFirstSeason = promotedShow.seasons[0]

              let newSeasonView: SeasonView = {
                id: tools.getGUID(),
                seasonInfo: showFirstSeason,
                watchedEpisodes: 0,
              }
              this.watchlist.queue.push(newSeasonView)
            }
            this.watchlist.backlog.splice(showInfoIdx, 1)
          }
        }

        await this.saveWatchlist()
      }
    },
    async demoteItem(itemId: string, sourceList: string) {
      if (this.watchlist) {
        if (sourceList === 'main') {
          // demote SeasonView from Main to top of Queue
          const seasonViewIdx = this.watchlist.main.findIndex((view: SeasonView) => view.id === itemId)
          if (seasonViewIdx !== -1) {
            const demotedSeasonView = this.watchlist.main[seasonViewIdx]
            this.watchlist.queue.splice(0, 0, demotedSeasonView)
            this.watchlist.main.splice(seasonViewIdx, 1)
          }
        }

        await this.saveWatchlist()
      }
    },
    async removeItem() {
      if (this.watchlist) {
        if ((this.targetListName === 'main' || this.targetListName === 'live' || this.targetListName === 'queue') && this.targetSeasonView) {
          this.targetSeasonView.droppedDate = (new Date()).toISOString()
          await watchlistService.SaveSeasonViews([ this.targetSeasonView ])

          const droppedViewId = this.targetSeasonView.id
          const droppedViewIdx = this.watchlist[this.targetListName].findIndex((view: SeasonView) => view.id === droppedViewId)
          if (droppedViewIdx !== -1) {
            this.watchlist[this.targetListName].splice(droppedViewIdx, 1)
          }
        }

        await this.saveWatchlist()
      }
      this.resetTargets()
    },
    openCatalog() {
      this.$bvModal.show('catalogModal')
    },
    closeCatalog() {
      this.$bvModal.hide('catalogModal')
    },
    onModalHide(event: BvModalEvent) {
      if (event.trigger !== 'ok') {
        this.resetTargets()
      }
    },
  },
});
</script>

<style>
#currently-watching-section {
  margin: 10px;
  border-radius: 10px;
  padding: 10px;
  text-align: left;
  background-color: #defb;
}
#buttons-container {
  padding: 5px 5px 0;
}
#main-live-container {
  padding: 0 10px;
}
#main-list, #queue-list, #upcoming-list {
  margin-bottom: 10px;
}
#inactive-sections-container {
  padding: 10px;
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

@media (min-width: 992px) {
  #all-sections-container {
    display: flex;
    align-items: stretch;
    height: 90vh;
  }
  #active-sections-container {
    display: flex;
    flex-direction: column;
    width: 70%;
    height: fit-content;
  }
  #currently-watching-section {
    margin-left: 0;
  }
  #main-live-container {
    flex-grow: 1;
    display: flex;
    padding-left: 0;
    width: 100%;
    height: fit-content;
    overflow: auto;
  }
  #main-list {
    padding-right: 5px;
    width: 50%;
    margin-bottom: 0;
    overflow-y: auto;
    height: 100%;
  }
  #live-list {
    display: flex;
    padding-left: 5px;
    width: 50%;
  }
  #inactive-sections-container {
    display: flex;
    padding: 10px 0px 10px 0;
    flex-direction: column;
    width: 30%;
    overflow-y: auto;
    height: 100%;
  }
  ::-webkit-scrollbar {
    width: 14px;
  }
  ::-webkit-scrollbar-thumb {
    border: 4px solid #0000;
    background-clip: padding-box;
    border-radius: 7px;
    background-color: #0003;
  }
  /* #queue-list {} */
  /* #upcoming-list {} */
  /* #backlog-list {} */
}
</style>