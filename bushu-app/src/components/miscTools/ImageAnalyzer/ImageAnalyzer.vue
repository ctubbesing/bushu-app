<template>
  <div>
    <b-input-group>
      <b-form-input
        v-model="url"
        placeholder="URL"
        debounce="500"
      />
      <template #append>
        <b-button @click="initImage">Analyze Image</b-button>
      </template>
    </b-input-group>
    <img
      :src="url"
      style="max-width: 250px; max-height: 250px; margin-top: 20px"
    >
    <div>
      <div>
        <color-histogram
          :all-colors="allColors"
          style="width: 100%; margin: 20px 0"
        />
      </div>
      <div id="color-samples">
        <div
          v-for="(color, idx) in allColors"
          :key="idx"
          :style="getColorSampleStyle(color)"
        >
          RGB: {{ getColorString(color.colorRGB) }}<br>
          HSL: {{ getColorString(color.colorHSL) }}<br>
          Count: {{ color.count }}
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import ColorHistogram from '@/components/miscTools/ImageAnalyzer/ColorHistogram.vue'
import ImageAnalyzerService from '@/utils/miscTools/ImageAnalyzer/ImageAnalyzerService'

interface ColorData {
  colorRGB: number[]
  colorHSL: number[]
  count: number
}

export default Vue.extend({
  name: 'ImageAnalyzer',
  components: {
    colorHistogram: ColorHistogram,
  },
  data() {
    return {
      url: 'https://picsum.photos/600/300/?image=655' as string,
      allColors: [] as ColorData[],
    }
  },
  methods: {
    getColorString(color: number[]): string {
      return `(${color[0]}, ${color[1]}, ${color[2]}, ${Math.round(color[3] * 1000) / 1000})`
    },
    getColorSampleStyle(color: ColorData): string {
      let style = `background-color: hsla(${color.colorHSL[0]}, ${color.colorHSL[1]}%, ${color.colorHSL[2]}%, ${color.colorHSL[3]});`
      style += `color: ${(color.colorHSL[2] > 50 || color.colorHSL[3] < 0.5) ? '#000' : '#fff'};`

      return style
    },
    async initImage() {
      this.allColors = await ImageAnalyzerService.GetImageColorData(this.url)
    },
  }
})
</script>

<style scoped>
#color-samples {
  display: flex;
  flex-wrap: wrap;
}
#color-samples > div {
  min-height: 50px;
  min-width: 50px;
  margin: 10px;
  padding: 5px;
  border-radius: 8px;
  font-size: 0.65em;
}
</style>
