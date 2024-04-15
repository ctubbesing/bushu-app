<template>
  <div class="home">
      <!-- :is-loading="true" -->
    <scroll-to-refresh
      :is-loading="loading"
      @refresh="handleScrollToRefresh"
    />
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
      iconPath: `
        M 2.5 6.5
        l 0 4
        l 5 0
        l 0 -1
        l -3 -3
        l -1.757359313 0
        l 1.757359313 0
        l 3 -3
        l 0 -1
        l -5 0
        z
      ` as string,
    };
  },
  methods: {
    async handleScrollToRefresh(key: string) {
      this.loading = true

      // for real
      // this.refreshKey = key
      // await this.refreshPage()

      // for testing
      await new Promise(r => setTimeout(r, 5000))

      this.loading = false
    },
    async refreshPage() {
      await dropbox.reloadAll()
    },
  },
});
</script>

<style scoped>
</style>
