<template>
  <div
    id="svg-wrapper"
    :style="`${styleDimensions}`"
  >
    <svg
      :viewBox="`0 0 ${viewboxWidthPx} ${viewboxHeightPx}`"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="0"
        y="0"
        :width="viewboxWidthPx"
        :height="viewboxHeightPx"
        stroke="none"
        :fill="boxColor"
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
          :stroke-dasharray="pathLength"
          :stroke="pathColor"
        />
        <path
          :d="iconPath"
          stroke-dasharray="16 16"
          :stroke="loadingColorA"
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
          :stroke="loadingColorB"
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
      </g>
    </svg>
    <svg
      v-if="!isLoading"
      :viewBox="`0 0 ${viewboxWidthPx} ${viewboxHeightPx}`"
      xmlns="http://www.w3.org/2000/svg"
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
      <path
        :d="iconPath"
        fill="none"
        stroke="url('#myGradient')"
        stroke-width="1"
        stroke-linejoin="round"
        stroke-linecap="round"
      >
        <animate
          class="end-animate"
          attributeName="stroke-dasharray"
          values="0 32; 32 0"
          begin="0s"
          :dur="'0.3s'"
        />
        <animate
          class="end-animate"
          attributeName="stroke-dashoffset"
          values="0; 16"
          begin="0s"
          :dur="'0.3s'"
        />
      </path>
    </svg>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
  name: 'LoadingIcon',
  props: {
    isLoading: {
      type: Boolean,
      required: false,
      default: true,
    },
    heightPx: {
      type: Number,
      required: true,
    },
  },
  data() {
    return {
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
      pathLength: 32 as number,
      boxColor: '#043' as string,
      pathColor: '#dfe7' as string,
      loadingColorA: '#fd8a' as string,
      loadingColorB: '#8dfa' as string,
      viewboxHeightPx: 13 as number,
      viewboxWidthPx: 10 as number,
    }
  },
  computed: {
    styleDimensions(): string {
      const width = this.heightPx * this.viewboxWidthPx / this.viewboxHeightPx
      return `height: ${this.heightPx}px; width: ${width}px;`
    },
  },
})
</script>

<style scoped>
#svg-wrapper {
  display: inline-block;
  position: relative;
  transition: height 0.5s;
}
svg {
  position: absolute;
  top: 0;
  left: 0;
}
</style>