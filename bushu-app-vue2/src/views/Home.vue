<template>
  <div class="home">
    <scroll-to-refresh
      :is-loading="isLoading"
      @refresh="handleRefresh"
    />
    <img
      src="@/assets/b314_icon_inner.svg"
      alt="bushu314 logo"
      style="margin: 50px 0 30px; max-width: 200px"
    />
    <widget-list :refreshTrigger="refreshKey" />
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
      isLoading: false as boolean,
    };
  },
  methods: {
    async handleRefresh(key: string) {
      this.isLoading = true

      this.refreshKey = key
      await dropbox.reloadAll()

      this.isLoading = false
    },
  },
});
</script>
