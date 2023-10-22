<template>
  <div :style="sizeStyle + colorStyle">
    <img
      :src="link"
      :style="sizeStyle + (doFaded ? 'opacity: 0.6;' : '') + (link ? '' : 'visibility: hidden;')"
    >
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  name: 'ThumbnailImage',
  props: {
    link: {
      type: String,
    },
    colorSeed: {
      type: String,
      required: false,
      default: '',
    },
    height: {
      type: Number,
    },
    doFaded: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  computed: {
    sizeStyle(): string {
      if (this.height) {
        return `height: ${this.height}px; width: ${this.height * 2 / 3}px; min-width: ${this.height * 2 / 3}px;`
      }
      return ''
    },
    colorStyle(): string {
      if (this.colorSeed.length >= 6) {
        return `background-color: #${this.colorSeed.slice(-6)};`
      }
      return 'background-color: #6c757d;'
    },
  },
})
</script>
