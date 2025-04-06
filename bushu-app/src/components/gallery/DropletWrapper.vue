<template>
  <div style="max-width: 400px;">
    <DropletRing :n="n" />

    <v-slider
      v-model="n"
      step="1"
      min="1"
      max="12"
      tick
      class="py-1 px-3"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import DropletRing from './DropletRing.vue'

const n = ref(3)
</script>
