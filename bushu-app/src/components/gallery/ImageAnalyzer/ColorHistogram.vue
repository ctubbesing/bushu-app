<template>
  <div id="svg-container">
    <svg viewBox="0 0 360 110">
      <defs>
        <linearGradient id="x-axis-gradient">
          <stop
            v-for="(stop, idx) in xAxisColors"
            :key="idx"
            :offset="stop.offset"
            :stop-color="stop.color"
          />
        </linearGradient>
      </defs>
      <rect
        x="0"
        y="0"
        width="100%"
        height="100%"
        fill="#def6"
      />
      <g id="background-lines"></g>
      <g id="values">
        <line
          v-for="(bucket, idx) in colorBuckets"
          :key="idx"
          :x1="bucket.hueAvg"
          :x2="bucket.hueAvg"
          y1="100"
          :y2="100 - (bucket.count * 100 / allColors.length)"
          :stroke-width="bucketWidth / 2"
          :stroke="'hsl(' + bucket.hueAvg + ', 80%, 50%)'"
        />
      </g>
      <g id="axes">
        <rect
          x="0"
          y="100"
          width="100%"
          :height="(1000 / 110) + '%'"
          fill="url(#x-axis-gradient)"
        />
      </g>
    </svg>
  </div>
</template>

<script lang="ts">
interface ColorData {
  colorRGB: number[]
  colorHSL: number[]
  count: number
}
interface ColorBucket {
  hueMin: number
  hueMax: number
  hueAvg: number
  count: number
}

export default {
  name: 'ColorHistogram',
  props: {
    allColors: {
      type: Array as () => ColorData[],
      required: true,
    },
  },
  data() {
    return {
      xAxisDivisions: 32 as number,
    }
  },
  computed: {
    bucketWidth(): number {
      return 360 / this.xAxisDivisions
    },
    colorBuckets(): ColorBucket[] {
      let buckets: ColorBucket[] = Array.from((new Array(this.xAxisDivisions)).keys()).map(i => {
        return {
          hueMin: i * this.bucketWidth,
          hueMax: i * this.bucketWidth + this.bucketWidth,
          hueAvg: i * this.bucketWidth + (this.bucketWidth / 2),
          count: 0,
        }
      })

      this.allColors.forEach((c: ColorData) => {
        let hueListIdx = Math.floor(c.colorHSL[0] / this.bucketWidth)
        buckets[hueListIdx].count++
      })

      return buckets
    },
    xAxisColors(): { offset: string, color: string }[] {
      let colors = [
        {
          offset: '0%',
          color: "hsl(0, 80%, 50%)",
        },
      ] as { offset: string, color: string }[]
      for (let i = 0; i < this.xAxisDivisions; i++)
      {
        colors.push({
          offset: (100 * (i + 1) / this.xAxisDivisions) + '%',
          color: `hsl(${360 * (i + 1) / this.xAxisDivisions}, 80%, 50%)`
        })
      }

      return colors
    },
  },
  methods: {}
}
</script>

<style scoped>
#svg-container {
  width: 50%;
}
#test-div {
  background-color: hsl(170, 100%, 50%);
}
</style>
