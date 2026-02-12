<template>
  <div>
    <!-- <scroll-to-refresh
      :is-loading="isLoading"
      @refresh="handleRefresh"
    /> -->
    <div
      v-if="watchlist"
      id="all-sections-container"
    >
      <div id="buttons-container">
        <v-btn
          icon="mdi-television-guide"
          color="app-gray"
          variant="outlined"
          @click="openCatalogModal()"
        />
      </div>
      <div id="active-sections-container">
        <div id="currently-watching-section">
          Currently Watching
        </div>
        <div id="main-live-container">
          <div id="main-list">
            <WatchlistSection
              v-model:season-views="watchlist.main"
              :list-type="'Main'"
              @add-item="console.log('@add-item -> selectCatalogEntry(Live)')"
              @mark-item-completed="console.log('@mark-item-completed -> showMarkCompletedOptions')"
              @demote-item="console.log('@demote-item -> demoteItem')"
              @remove-item="console.log('@remove-item -> promptConfirmRemoveItem')"
            />
            <!-- <watchlist-section /////////////// TODO: fix
              v-model="watchlist.main"
              :list-type="'main'"
              @add-item="selectCatalogEntry('main')"
              @mark-item-completed="showMarkCompletedOptions"
              @demote-item="demoteItem"
              @remove-item="promptConfirmRemoveItem"
            /> -->
          </div>
          <div id="live-list">
            <WatchlistSection
              v-model:season-views="watchlist.live"
              :list-type="'Live'"
              @add-item="console.log('@add-item -> selectCatalogEntry(Live)')"
              @mark-item-completed="console.log('@mark-item-completed -> showMarkCompletedOptions')"
              @promote-item="console.log('@promote-item -> promoteItem')"
              @demote-item="console.log('@demote-item -> demoteItem')"
              @remove-item="console.log('@remove-item -> promptConfirmRemoveItem')"
              @irregular-seasons-updated="console.log('@irregular-seasons-updated -> loadWatchlist()')"
            />
            <!-- <watchlist-section /////////////// TODO: fix
              v-model="watchlist.live"
              :list-type="'live'"
              @add-item="selectCatalogEntry('live')"
              @mark-item-completed="showMarkCompletedOptions"
              @promote-item="promoteItem"
              @demote-item="demoteItem"
              @remove-item="promptConfirmRemoveItem"
              @irregular-seasons-updated="loadWatchlist()"
            /> -->
          </div>
        </div>
      </div>
      <div id="inactive-sections-container">
        <div id="queue-list">
          <WatchlistSection
            v-model:season-views="watchlist.queue"
            :list-type="'Queue'"
            @add-item="console.log('QUEUE @add-item -> selectCatalogEntry(Queue)' + $event)"
            @promote-item="console.log('QUEUE @promote-item -> promoteItem' + $event + $event)"
            @remove-item="console.log('QUEUE @remove-item -> promptConfirmRemoveItem' + $event)"
            @reorder="console.log('QUEUE @reorder -> onReorderList' + $event)"
          />
          <!-- <watchlist-section /////////////// TODO: fix
            v-model="watchlist.queue"
            :list-type="'queue'"
            @add-item="selectCatalogEntry('queue')"
            @promote-item="promoteItem"
            @remove-item="promptConfirmRemoveItem"
            @reorder="onReorderList"
          /> -->
        </div>
        <div id="upcoming-list">
          <WatchlistSection
            v-model:seasons="watchlist.upcoming"
            :list-type="'Upcoming'"
            @add-item="console.log('@add-item -> selectCatalogEntry(Upcoming)')"
            @promote-item="console.log('@promote-item -> promoteItem')"
            @remove-item="console.log('@remove-item -> promptConfirmRemoveItem')"
            @irregular-seasons-updated="console.log('@irregular-seasons-updated -> loadWatchlist()')"
          />
          <!-- <watchlist-section /////////////// TODO: fix
            v-model="watchlist.upcoming"
            :list-type="'upcoming'"
            @add-item="selectCatalogEntry('upcoming')"
            @promote-item="promoteItem"
            @remove-item="promptConfirmRemoveItem"
            @irregular-seasons-updated="loadWatchlist()"
          /> -->
        </div>
        <div id="backlog-list">
          <WatchlistSection
            v-model:shows="watchlist.backlog"
            :list-type="'Backlog'"
            @add-item="console.log('@add-item -> selectCatalogEntry(Backlog)')"
            @promote-item="console.log('@promote-item -> promoteItem')"
            @remove-item="console.log('@remove-item -> promptConfirmRemoveItem')"
            @reorder="console.log('@reorder -> onReorderList')"
          />
          <!-- <watchlist-section /////////////// TODO: fix
            v-model="watchlist.backlog"
            :list-type="'backlog'"
            @add-item="selectCatalogEntry('backlog')"
            @promote-item="promoteItem"
            @remove-item="promptConfirmRemoveItem"
            @reorder="onReorderList"
          /> -->
        </div>
      </div>
    </div>
    <!-- Catalog Modal -->
    <CatalogModal
      v-model="showCatalogModal"
    />
    <!-- <catalog-modal
      id="catalogModal"
      :selection-target-list="targetListName"
      @item-selected="addCatalogItemToList"
      @hidden="resetTargets()"
    /> -->
    <!-- Mark Completed Modal -->
    <!-- <b-modal
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
    </b-modal> -->
    <!-- Confirm Drop Modal -->
    <!-- <b-modal
      v-if="targetListName"
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
      The season will be {{ targetSeasonView ? 'marked as Dropped and' : '' }} removed from
      {{ targetListName === 'queue' || targetListName === 'backlog' ? 'the ' : '' }}{{ toTitleCase(targetListName) }}.
    </b-modal> -->
  </div>
</template>

<script lang="ts" setup>
import CatalogModal from '@/components/Watchlist/CatalogModal.vue'
import WatchlistSection from '@/components/Watchlist/WatchlistSection.vue'
import { useDropbox } from '@/stores/dropbox'
import { useWatchlist } from '@/stores/watchlist'
import { WatchlistData } from '@/types/watchlistTypes'
import watchlistService from '@/utils/services/watchlistService'
import { ref, watch } from 'vue'

const watchlistStore = useWatchlist()
const dropboxStore = useDropbox()

const isLoading = ref(false)
const watchlist = ref<WatchlistData>()

// const loadData = async (doForceReload = false) => {
//   isLoading.value = true

//   await watchlistStore.loadCatalogFromDropbox()
//   await this.loadWatchlist(doForceReload)

//   isLoading.value = false
// }

const loadData = async (doForceReload: boolean = false) => {
  if (dropboxStore.isReady) {
    isLoading.value = true

    await watchlistStore.loadCatalog()
    watchlist.value = await watchlistService.GetWatchlistData(doForceReload)

    isLoading.value = false
  }
}

watch(() => dropboxStore.isReady, loadData, { immediate: true })

const showCatalogModal = ref(false)
const openCatalogModal = () => showCatalogModal.value = true
</script>

<style scoped>
#currently-watching-section {
  display: none;
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
  margin-top: 10px;
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
