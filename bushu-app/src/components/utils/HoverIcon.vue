<template>
  <b-icon
    :icon="icon + getSuffix()"
    :font-scale="scale ? scale : '1'"
    :variant="variant"
    style="cursor: pointer"
    @mouseenter="isHovering = true"
    @mouseleave="isHovering = false"
    @click="$emit('click')"
  />
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  props: {
    icon: String,
    scale: String,
    variant: String,
  },
  name: 'HoverIcon',
  data() {
    return {
      isHovering: false as boolean,
    }
  },
  methods: {
    getSuffix(): string {
      return (!this.isHovering || this.icon.slice(-5) === '-fill') ? '' : '-fill'
    },
  },
})
</script>
