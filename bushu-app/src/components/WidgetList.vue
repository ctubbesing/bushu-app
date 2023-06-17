<template>
  <div class="all-widgets">
    <template v-for="(widget, idx) in displayedWidgets">
      <!-- WaniKani -->
      <wanikani-widget
        v-if="widget === 'wanikani'"
        :key="'wanikani' + idx + refreshTrigger"
      />
      <!-- Another sample widget -->
      <basic-widget
        v-if="widget === 'test'"
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
    </template>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import WanikaniWidget from './WanikaniWidget.vue'
import BasicWidget from './BasicWidget.vue'

export default Vue.extend({
  name: 'WidgetList',
  props: {
    refreshTrigger: String,
  },
  components: {
    wanikaniWidget: WanikaniWidget,
    basicWidget: BasicWidget,
  },
  computed: {
    displayedWidgets(): string[] {
      return this.$store.state.userWidgets
    },
  },
})
</script>

<style scoped>
.all-widgets {
  margin: 20px;
  padding: 10px;
  border-radius: 10px;
  background-color: #fff5;
}
</style>