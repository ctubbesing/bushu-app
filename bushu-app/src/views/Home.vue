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
      viewBox="0 0 10 13"
      xmlns="http://www.w3.org/2000/svg"
      height="50%"
      width="50%"
    >
      <!-- :style="styleDimensions" -->
      <!-- max-height="100%"
      max-width="100%" -->
      <defs>
        <linearGradient
          id="myGradient"
          gradientTransform="rotate(90)"
        >
          <stop offset="5%" stop-color="gold" />
          <stop offset="95%" stop-color="red" />
        </linearGradient>
      </defs>
      <g>
        <rect
          x="0"
          y="0"
          width="10"
          height="13"
          stroke="none"
          :fill="'#043'"
          rx="2.5"
        />
        <g
          fill="none"
          stroke-width="1"
          stroke-linejoin="round"
          stroke-linecap="round"
        >
          <path
            :d="iconPath"
            stroke-dasharray="32.5"
            :stroke="'#dfe7'"
          />
          <path
            :d="iconPath"
            stroke-dasharray="16 16"
            :stroke="'#fd8a'"
          >
            <animate
              attributeName="stroke-dashoffset"
              values="16; 48"
              :begin="'0s'"
              :dur="'2s'"
              repeatCount="indefinite"
            />
          </path>
          <path
            :d="iconPath"
            :stroke="'#8dfa'"
            stroke-dasharray="16 16"
          >
            <animate
              attributeName="stroke-dashoffset"
              values="0; -32"
              :begin="'0s'"
              :dur="'2s'"
              repeatCount="indefinite"
            />
          </path>
          <path
            v-if="false"
            :d="iconPath"
            stroke="url('#myGradient')"
          >
            <animate
              class="end-animate"
              attributeName="stroke-dasharray"
              values="0 32; 32 0"
              begin="indefinite"
              :dur="'0.5s'"
            />
            <animate
              class="end-animate"
              attributeName="stroke-dashoffset"
              values="0; 16"
              begin="indefinite"
              :dur="'0.5s'"
            />
          </path>
        </g>
      </g>
    </svg>
    <div style="display: inline-block">
      <svg
        viewBox="0 0 10 13"
        xmlns="http://www.w3.org/2000/svg"
        height="50%"
        width="50%"
      >
        <!-- :style="styleDimensions" -->
        <!-- max-height="100%"
        max-width="100%" -->
        <defs>
          <linearGradient
            id="myGradient"
            gradientTransform="rotate(90)"
          >
            <stop offset="5%" stop-color="gold" />
            <stop offset="95%" stop-color="red" />
          </linearGradient>
        </defs>
        <g>
          <rect
            x="0"
            y="0"
            width="10"
            height="13"
            stroke="none"
            :fill="'#043'"
            rx="2.5"
          />
          <g
            fill="none"
            stroke-width="1"
            stroke-linejoin="round"
            stroke-linecap="round"
          >
            <path
              :d="iconPath"
              stroke-dasharray="32.5"
              :stroke="'#dfe7'"
            />
            <path
              :d="iconPath"
              stroke-dasharray="16 16"
              :stroke="'#fd8a'"
            >
              <animate
                attributeName="stroke-dashoffset"
                values="16; 48"
                :begin="'0s'"
                :dur="'2s'"
                repeatCount="indefinite"
              />
            </path>
            <path
              :d="iconPath"
              :stroke="'#8dfa'"
              stroke-dasharray="16 16"
            >
              <animate
                attributeName="stroke-dashoffset"
                values="0; -32"
                :begin="'0s'"
                :dur="'2s'"
                repeatCount="indefinite"
              />
            </path>
            <path
              v-if="false"
              :d="iconPath"
              stroke="url('#myGradient')"
            >
              <animate
                class="end-animate"
                attributeName="stroke-dasharray"
                values="0 32; 32 0"
                begin="indefinite"
                :dur="'0.5s'"
              />
              <animate
                class="end-animate"
                attributeName="stroke-dashoffset"
                values="0; 16"
                begin="indefinite"
                :dur="'0.5s'"
              />
            </path>
          </g>
        </g>
      </svg>
    </div>
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
