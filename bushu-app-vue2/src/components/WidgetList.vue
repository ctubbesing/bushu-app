<template>
  <div class="all-widgets">
    <b-spinner
      v-if="$store.state.isLoading"
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
          <b-button>Test Button</b-button>
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
          <b-button>Test Button #2</b-button>
        </basic-widget>
      </template>
    </template>
    <div style="margin: 5px 0 0">
      <hover-icon
        icon="gear"
        scale="1.5"
        variant="secondary"
        @click="openModal()"
      />
    </div>
    <!-- Settings Modal -->
    <b-modal
      id="settingsModal"
      title="Edit Widget Layout"
      size="lg"
      centered
      hide-footer
      @hidden="onModalClose()"
    >
      <b-row style="margin-bottom: 10px">
        <b-col sm="7">
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
                <hover-icon
                  icon="trash"
                  scale="1.5"
                  variant="danger"
                  @click="removeWidget(idx)"
                />
              </div>
            </div>
          </div>
        </b-col>
        <b-col>
          <small>All Widgets:</small>
          <b-card no-body>
            <b-list-group flush>
              <b-list-group-item
                v-for="(w, idx) in allWidgets"
                :key="w.id"
                class="d-flex justify-content-between align-items-center"
              >
                <div style="display: inline-block">
                  <h5>{{ w.name }}</h5>
                  <small>{{ w.description }}</small>
                </div>
                <hover-icon
                  icon="plus-circle"
                  scale="1.5"
                  variant="primary"
                  @click="addWidget(idx)"
                />
              </b-list-group-item>
            </b-list-group>
          </b-card>
        </b-col>
      </b-row>
      <b-row>
        <b-col sm="4">
          <b-button
            variant="outline-danger"
            style="width: 100%; margin-bottom: 5px"
            @click="undoChanges()"
          >
            Cancel
          </b-button>
        </b-col>
        <b-col>
          <b-button
            variant="outline-secondary"
            style="width: 100%"
            @click="closeModal()"
          >
            Done
          </b-button>
        </b-col>
      </b-row>
    </b-modal>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import WanikaniWidget from './WanikaniWidget.vue'
import BasicWidget from './BasicWidget.vue'
import HoverIcon from '@/components/utils/HoverIcon.vue'
import { WidgetData } from '@/types/generalTypes'
import dropbox from '@/utils/dropbox'

export default Vue.extend({
  name: 'WidgetList',
  props: {
    refreshTrigger: String,
  },
  components: {
    wanikaniWidget: WanikaniWidget,
    basicWidget: BasicWidget,
    hoverIcon: HoverIcon,
  },
  data() {
    return {
      allWidgets: [
        {
          id: 'wanikani',
          name: 'WaniKani',
          description: 'Do your reviews!'
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
      displayedWidgets: [] as WidgetData[],
    }
  },
  watch: {
    '$store.state.userWidgets': function() {
      this.syncWithStore()
    }
  },
  created() {
    this.syncWithStore()
  },
  methods: {
    syncWithStore() {
      this.displayedWidgets = this.$store.state.userWidgets.map((id: string): WidgetData | undefined => {
        return this.allWidgets.find((w: WidgetData) => w.id === id)
      }).filter((w: WidgetData | undefined) => w !== undefined)
    },
    addWidget(idx: number) {
      this.displayedWidgets.push(this.allWidgets[idx])
    },
    removeWidget(idx: number) {
      this.displayedWidgets.splice(idx, 1)
    },
    undoChanges() {
      this.syncWithStore()
      this.closeModal()
    },
    openModal() {
      this.$bvModal.show('settingsModal')
    },
    closeModal() {
      this.$bvModal.hide('settingsModal')
    },
    async onModalClose() {
      // update store and save changes to Dropbox
      this.$store.dispatch('updateUserWidgets', this.displayedWidgets.map(w => w.id))
      await dropbox.saveSettings()
    },
  },
})
</script>

<style scoped>
.all-widgets {
  margin: 20px;
  padding: 10px 10px 5px;
  border-radius: 10px;
  background-color: #fff5;
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