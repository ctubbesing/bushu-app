<template>
  <svg
    :viewBox="'0 0 ' + pxCols + ' ' + pxRows"
    xmlns="http://www.w3.org/2000/svg"
  >
    <mask id="dropletMask">
      <rect
        x="0"
        y="0"
        width="100%"
        height="100%"
        fill="black"
      />
      <circle
        :cx="R"
        :cy="R"
        :r="R"
        fill="white"
      />
      <rect
        x="0"
        :y="R - de"
        width="100%"
        height="100%"
        fill="black"
        :transform="'rotate(' + (-180 / n) + ', ' + R + ', ' + R + ')'"
      />
      <path
        fill="black"
        :d="`
          M ${R} ${R}
          l 0 ${-R}
          a ${R} ${R} 0
            1 1
            ${-R * Math.sin(2 * Math.PI / n)} ${R - R * Math.cos(2 * Math.PI / n)}
          z
        `"
      />
      <circle
        :cx="R"
        :cy="r"
        :r="r"
        fill="white"
      />
      <circle
        :cx="R"
        :cy="r"
        :r="r"
        :transform="'rotate(' + (-360 / n) + ', ' + R + ', ' + R + ')'"
        fill="black"
      />
    </mask>
    <circle
      v-for="i in n"
      :key="'droplet' + i"
      :cx="R"
      :cy="R"
      :r="R"
      :fill="`hsl(${i * 360 / n}, 50%, 60%)`"
      mask="url(#dropletMask)"
      :transform="`rotate(${i * 360 / n}, ${R}, ${R})`"
    />
  </svg>
</template>

<script lang="ts">
export default {
  name: 'DropletRing',
  props: ['n'],
  data() {
    return {
      pxRows: 10,
      pxCols: 10,
    }
  },
  computed: {
    R(): number { // radius of outer circle
      return Math.min(this.pxRows, this.pxCols) / 2
    },
    r(): number { // radius of inner circles
      let l0 = Math.sqrt(2 - 2 * Math.cos(2 * Math.PI / this.n))
      return this.R * l0 / (2 + l0)
    },
    de(): number { // distance from center to point where inner circles touch
      return this.r / Math.tan(Math.PI / this.n)
    },
  },
  methods: {}
}
</script>
