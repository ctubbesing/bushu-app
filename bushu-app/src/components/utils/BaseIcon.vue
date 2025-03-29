<template>
  <v-icon
    :icon="iconName"
    :size="size"
    :color="color"
    style="cursor: pointer"
    @mouseenter="isHovering = true"
    @mouseleave="isHovering = false"
  />
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';
// import { VIcon } from 'vuetify/components/VIcon'

const props = defineProps({
  icon: {
    type: String,
    required: true,
  },
  doHover: {
    type: Boolean,
    required: false,
    default: true,
  },
  size: String,
  color: String,
})

const isHovering = ref(false)

const iconName = computed((): string => {
  let name: string = props.icon
  if (name.slice(3) !== 'mdi-') {
    name = 'mdi-' + name
  }

  if (props.doHover && !isHovering.value) {
    name = name + '-outline'
  }
  
  return name
})
</script>
