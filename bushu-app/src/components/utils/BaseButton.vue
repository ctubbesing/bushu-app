<template>
  <v-btn
    @click="$emit($event)"
  >
    <slot></slot>
  </v-btn>
</template>

<script lang="ts" setup>
import { VBtn } from 'vuetify/components/VBtn'
</script>
