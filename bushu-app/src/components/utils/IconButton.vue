<template>
  <b-button
    :variant="variant ? variant : 'outline-secondary'"
    pill
    @click="$emit('click')"
    style="padding: 12px 14px"
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
})
</script>
