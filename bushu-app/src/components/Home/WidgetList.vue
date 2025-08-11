<template>
  <div class="all-widgets">
    <base-loader
      v-if="homeStore.isLoading"
      variant="secondary"
    />
    <template v-else>
      <template v-for="(widget, idx) in displayedWidgets">
        <!-- WaniKani -->
        <wanikani-widget
          v-if="widget.id === 'wanikani'"
          :key="'wanikani' + idx + refreshTrigger"
        />
        <!-- Sample widget 1 -->
        <basic-widget
          v-if="widget.id === 'test'"
          :key="'test' + idx + refreshTrigger"
        >
          <template v-slot:header>
            Test Widget {{ idx }}
          </template>
          <div>
            test content a
          </div>
          <div>
            test content b
          </div>
          <v-btn>Test Button</v-btn>
        </basic-widget>
        <!-- Sample widget 2 -->
        <basic-widget
          v-if="widget.id === 'test2'"
          :key="'test2' + idx + refreshTrigger"
        >
          <template v-slot:header>
            Other Test Widget {{ idx }}
          </template>
          <div>
            test content ba
          </div>
          <div>
            test content bb
          </div>
          <div>
            test content bc
          </div>
          <v-btn>Test Button #2</v-btn>
        </basic-widget>
      </template>
    </template>
    <div style="margin: 5px 0 0">
      <v-btn
        icon="mdi-cog"
        size="x-small"
        color="grey"
        class="color-on-hover"
        @click="openModal()"
      />
    </div>
    <!-- Settings Modal -->
    <base-modal
      v-model="isSettingsModalOpen"
      title="Edit Widget Layout"
      titleIcon="mdi-widgets"
      @ok="closeModal()"
      @cancel="undoChanges()"
      @hidden="onModalClose()"
    >
      <!-- don't be dumb this is a base-row make it a base-row -->
      <div style="display: flex; flex-wrap: wrap; margin-bottom: 10px">
        <!-- same but base-col -->
        <div style="flex: 7; min-width: 300px; margin: 0 5px">
          <small>Displayed Widgets:</small>
          <div>
            <div
              v-for="(w, idx) in displayedWidgets"
              :key="idx"
              class="displayed-widget-list-item"
            >
              <div>
                <h3>{{ w.name }}</h3>
                <small>{{ w.description }}</small>
              </div>
              <div>
                <v-btn
                  icon="mdi-trash-can"
                  size="small"
                  color="red-darken-1"
                  class="color-on-hover"
                  @click="removeWidget(idx)"
                />
              </div>
            </div>
          </div>
        </div>
        <div style="flex: 5; margin: 0 5px">
          <small>All Widgets:</small>
          <!-- this is a base-list-group -->
          <div class="all-widgets-list">
            <!-- and a base-list-group-item -->
            <div
              v-for="(w, idx) in allWidgets"
              :key="w.id"
              class="all-widgets-list-item"
            >
              <div style="display: inline-block">
                <h5>{{ w.name }}</h5>
                <small>{{ w.description }}</small>
              </div>
              <v-btn
                icon="mdi-plus-circle-outline"
                size="small"
                color="white"
                class="ml-1"
                @click="addWidget(idx)"
              />
            </div>
          </div>
        </div>
      </div>
    </base-modal>
  </div>
</template>

<script lang="ts">
import WanikaniWidget from './WanikaniWidget.vue'
import BasicWidget from './BasicWidget.vue'
import { mapStores } from 'pinia'
import { useHome } from '@/stores/home'
import dropbox from '@/translators/dropbox'
import type { WidgetData } from '@/types/generalTypes'

export default {
  name: 'WidgetList',
  props: {
    refreshTrigger: String,
  },
  components: {
    wanikaniWidget: WanikaniWidget,
    basicWidget: BasicWidget,
  },
  data() {
    return {
      allWidgets: [
        {
          id: 'wanikani',
          name: 'WaniKani',
          description: 'Keep up with ur reviews pls'
        },
        {
          id: 'test',
          name: 'Test Widget',
          description: 'Don\'t have enough widgets defined yet so here\'s just a sample'
        },
        {
          id: 'test2',
          name: 'Test Widget 2',
          description: 'Another sample widget. Doesn\'t do much'
        },
      ] as WidgetData[],
      isSettingsModalOpen: false as boolean,
      originalStoreUserWidgets: [] as string[],
    }
  },
  computed: {
    ...mapStores(useHome),
    displayedWidgets(): WidgetData[] {
      return this.homeStore.userWidgets
        .map((widgetId: string) => {
          return this.allWidgets.find((w: WidgetData) => w.id === widgetId)!
        })
        .filter((w: WidgetData | undefined) => !!w)
    },
  },
  methods: {
    addWidget(idx: number) {
      const widgetId = this.allWidgets[idx]?.id
      if (widgetId) {
        this.homeStore.userWidgets.push(widgetId)
      }
    },
    removeWidget(idx: number) {
      this.homeStore.userWidgets.splice(idx, 1)
    },
    undoChanges() {
      this.homeStore.userWidgets = this.originalStoreUserWidgets.map((w) => w)
      this.closeModal()
    },
    openModal() {
      this.isSettingsModalOpen = true
      this.originalStoreUserWidgets = this.homeStore.userWidgets.map((w) => w)
    },
    closeModal() {
      this.isSettingsModalOpen = false
    },
    async onModalClose() {
      await dropbox.saveSettings()
    },
  },
}
</script>

<style scoped>
.all-widgets {
  margin: 20px;
  padding: 10px 10px 5px;
  border-radius: 10px;
  background-color: #fff5;
}
.all-widgets-list {
  border: 0.8px solid #0002;
  border-radius: 10px;
}
.all-widgets-list-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  border-bottom: 0.8px solid #0002;
}
.all-widgets-list-item:last-child {
  border-bottom: none;
}
.displayed-widget-list-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  margin: 5px;
  border-radius: 5px;
  background-color: hsl(192, 71%, 85%);
}
</style>