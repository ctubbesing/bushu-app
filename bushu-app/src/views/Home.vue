<template>
  <div class="home">
    <scroll-to-refresh @refresh="handleScrollToRefresh" />
    <!-- <b-icon
      icon="hexagon"
      font-scale="2"
      :animation="loading ? 'spin' : ''"
      class="loading-icon"
    /> -->
    <img
      src="@/assets/b314_icon_inner.svg"
      alt="bushu314 logo"
      style="margin-top: 50px; max-width: 250px"
    />
    <widget-list
      :refreshTrigger="refreshKey"
    />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import ScrollToRefresh from '@/components/utils/ScrollToRefresh.vue'
import WidgetList from '@/components/WidgetList.vue'
import dropbox from '@/utils/dropbox'

export default Vue.extend({
  name: "Home",
  components: {
    widgetList: WidgetList,
    scrollToRefresh: ScrollToRefresh,
  },
  data() {
    return {
      doRefresh: false as boolean,
      refreshKey: '' as string,
      loading: false as boolean,
    };
  },
  methods: {
    async handleScrollToRefresh(key: string) {
      this.loading = true
      this.refreshKey = key
      await this.refreshPage()
      this.loading = false
    },
    async refreshPage() {
      await dropbox.reloadAll()
    },
  },
});
</script>

<style scoped>
/* .loading-icon {
  position: absolute;
  left: 0;
  right: 0;
  margin-top: -50px;
  margin-left: auto;
  margin-right: auto;
} */
</style>
