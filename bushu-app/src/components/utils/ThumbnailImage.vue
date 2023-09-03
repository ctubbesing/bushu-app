<template>
  <div class="width-adjusting-to-height">
    <svg viewBox="0 0 2 3"></svg>
    <div
      class="content"
      :style="'background-color: ' + emptyColor"
    >
      <img
        v-if="link"
        :src="link"
        class="content"
      >
    </div>
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
  },
  computed: {
    emptyColor(): string {
      if (this.colorSeed.length >= 6) {
        return '#' + this.colorSeed.slice(-6)
      }
      return '#6c757d'
    },
  },
})
</script>

<style scoped>
.width-adjusting-to-height {
  display: inline-block;
  position: relative;
}
.width-adjusting-to-height > svg {
  height: 100%;
}
.width-adjusting-to-height .content {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
</style>
