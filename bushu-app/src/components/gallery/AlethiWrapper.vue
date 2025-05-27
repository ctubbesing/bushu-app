<template>
  <div>
    <AlethiScript :text />

    <v-text-field
      v-model="text"
      label="Enter text"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import AlethiScript from './AlethiScript.vue'

const text = ref<string>()
</script>
