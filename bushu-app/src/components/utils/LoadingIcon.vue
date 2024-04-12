<template>
  <svg
    id="loading-icon"
    viewBox="0 0 10 13"
    xmlns="http://www.w3.org/2000/svg"
    max-height="100%"
    max-width="100%"
  >
    <!-- :style="styleDimensions" -->
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
          stroke-dasharray="32.5"
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
        <path
          v-if="!isLoading"
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
    maxHeight: {
      type: String,
      required: false,
      default: '',
    },
    maxWidth: {
      type: String,
      required: false,
      default: '',
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
      boxColor: '#043' as string,
      pathColor: '#dfe7' as string,
      loadingColorA: '#fd8a' as string,
      loadingColorB: '#8dfa' as string,
    }
  },
  computed: {
    styleDimensions(): string {
      let style = ''
      if (this.maxHeight) {
        style += `max-height: ${this.maxHeight}; `
      }
      if (this.maxWidth) {
        style += `max-width: ${this.maxWidth};`
      }
      if (!this.maxHeight && !this.maxWidth) {
        style = 'max-height: 100%'
      }
      return style
    },
    // usedMaxHeight(): string {
    //   if (this.maxHeight) {
    //     return this.maxHeight
    //   } else if (!this.maxWidth) {
    //     return '100%'
    //   }
    // },
  },
  watch: {
    isLoading(loading: boolean) {
      if (!loading) {
        this.$nextTick(() => {
          let elements = document.getElementsByClassName('end-animate') as unknown as SVGAnimationElement[]
          for (let i = 0; i < elements.length; i++) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            elements[i].beginElement()
          }
        })
      }
    },
  },
})
</script>
