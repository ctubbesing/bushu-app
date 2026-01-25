<template>
  <svg
    :view-box="`0 0 ${totalWidth} ${totalHeight}`"
    :width="totalWidth"
    :height="totalHeight"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect x="0" y="0" width="100%" height="100%" fill="#def" />
    <g stroke="#00f">
      <line
        :x1="padding"
        :y1="1.5 * imgHeight + padding"
        :x2="3 * padding + 2 * imgWidth"
        :y2="padding"
      />
      <line
        :x1="padding"
        :y1="1.5 * imgHeight + padding"
        :x2="3 * padding + 2 * imgWidth"
        :y2="padding"
      />
      <line
        :x1="padding"
        :y1="1.5 * imgHeight + padding"
        :x2="3 * padding + 2 * imgWidth"
        :y2="padding"
      />
    </g>
    <image
      :href="srcUrl"
      :width="imgWidth"
      :height="imgHeight"
      :transform="`
        translate(${3 * padding + 2 * imgWidth}, ${padding})
        skewY(20)
        `"
      preserveAspectRatio="none"
    />
    <rect
      :width="imgWidth"
      :height="imgHeight"
      :transform="`
        translate(${2 * padding + imgWidth}, ${imgHeight + padding})
        skewY(20)
        `"
      fill="blue"
    />
    <rect
      :width="imgWidth"
      :height="imgHeight"
      :transform="`
        translate(${resultLeftX}, ${resultTopLeftY})
        skewY(20)
        `"
      fill="red"
    />
  </svg>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'

const props = defineProps<{
  srcUrl: string,
  srcWidth: number,
  srcHeight: number,
}>()

const padding = ref(25)
const totalWidth = ref(600)
const totalHeight = ref(500)

const imgWidth = computed((): number => (totalWidth.value - padding.value) / 3 - padding.value)
const imgHeight = computed((): number => props.srcWidth === 0 ? 0 : (imgWidth.value * props.srcHeight) / props.srcWidth)

const sin20 = Math.sin(Math.PI / 9)

const resultTopLeftY = computed((): number => 1.5 * imgHeight.value + padding.value)
const resultLeftX = computed((): number => padding.value)
// const resultTopRight = computed((): number => )
const resultBottomLeftY = computed((): number => 2.5 * imgHeight.value + padding.value)
const resultBottomRight = computed((): number => 2.5 * imgHeight.value + padding.value)
</script>
