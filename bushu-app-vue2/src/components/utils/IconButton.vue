<template>
  <b-button
    id="main-button"
    :variant="variant ? variant : 'outline-secondary'"
    pill
    @click="$emit('click')"
    :style="paddingStyle"
  >
    <b-icon
      :icon="icon"
      :font-scale="scale ? scale : '1'"
      style="cursor: pointer; margin-bottom: -2px;"
    />
  </b-button>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  name: 'IconButton',
  props: {
    icon: String,
    scale: String,
    variant: String,
  },
  computed: {
    isMobile(): boolean {
      return window.innerWidth < 992
    },
    paddingStyle(): string {
      return `padding: ${this.isMobile ? '10px 14px 14px' : '12px 14px'}`
    },
  },
})
</script>
