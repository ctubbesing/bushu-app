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
    <svg
      viewBox="2 2.5 16 15"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      stroke="url('#myGradient')"
      stroke-width="1"
      stroke-linejoin="round"
      stroke-linecap="round"
    >
      <defs>
        <linearGradient
          id="myGradient"
          gradientTransform="rotate(90)"
        >
          <stop offset="5%" stop-color="gold" />
          <stop offset="95%" stop-color="red" />
        </linearGradient>
      </defs>
      <!-- Box -->
      <path
        d="
          M 2.5 3
          l 15 0
          l 0 14
          l -15 0
          Z
        "
        stroke="#043"
        fill="#043"
      />
      <!-- B -->
      <path
        d="
          M 8.5 7
          l 0 -1
          l -5 0
          l 0 8
          l 5 0
          l 0 -1
          l -3 -3
          l -2 0
          l 2 0
          z
        "
      />
      <!-- 3 -->
      <path
        d="
          M 3.5 4
          l 7 0
          l 0 12
          l -7 0
          m 7 -6
          l -2 0
        "
      />
      <!-- 1 -->
      <path
        d="
          M 13.5 12
          l 0 4
          m -0 -3
          l -1 0
          m 0 3
          l 2 0
        "
      />
      <!-- 4 -->
      <path
        d="
          M 12.5 4
          l 0 6
          l 4 0
          m 0 -6
          l 0 12
        "
      />
    </svg>
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
      // await new Promise(r => setTimeout(r, 5000))
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
