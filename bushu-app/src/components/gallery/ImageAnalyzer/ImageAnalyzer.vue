<template>
  <div>
    <v-form>
      <v-container>
        <v-text-field
          v-model="url"
          label="URL"
        >
          <template #append>
            <v-btn
              color="app-header"
              @click="initImage"
            >
              Analyze Image
            </v-btn>
            <v-btn
              v-if="allColors?.length"
              color="error"
              class="ml-1"
              @click="allColors = []"
            >
              Reset
            </v-btn>
          </template>
        </v-text-field>
      </v-container>
    </v-form>
    <img
      :src="url"
      style="max-width: 250px; max-height: 250px; margin-top: 20px"
    >
    <div :style="selectedColorsStyle">&nbsp;</div>
    <div>
      <div>
        <ColorHistogram
          v-if="allColors.length > 0"
          :all-colors="allColors"
          style="width: 100%; margin: 20px 0"
        />
      </div>
      <div id="color-samples">
        <div
          v-for="(color, idx) in displayedColors"
          :key="idx"
          :style="getColorSampleStyle(color)"
        >
          RGB: {{ getColorString(color.colorRGB) }}<br>
          HSL: {{ getColorString(color.colorHSL) }}<br>
          Count: {{ color.count }}
        </div>
      </div>
      <v-btn @click="showAllColors = !showAllColors">
        {{ showAllColors ? 'Collapse' : 'Show' }} full color list
      </v-btn>
    </div>
  </div>
</template>

<script lang="ts">
import ImageAnalyzerService from '@/utils/miscTools/ImageAnalyzer/ImageAnalyzerService'
import ColorHistogram from './ColorHistogram.vue'

interface ColorData {
  colorRGB: number[]
  colorHSL: number[]
  count: number
}

export default {
  name: 'ImageAnalyzer',
  components: {
    ColorHistogram,
  },
  data() {
    return {
      url: 'https://picsum.photos/600/300/?image=400' as string,
      allColors: [] as ColorData[],
      showAllColors: false as boolean,
    }
  },
  computed: {
    selectedColorsStyle(): string {
      if (this.allColors.length === 0) {
        return 'display: none'
      } else {
        const selectedColorLimit = 3
        const hueBucketRadius = 10
        let usedHues: number[] = []
        let selectedColors: string[] = []

        for (let i = 0; i < this.allColors.length; i++) {
          let currentHue = this.allColors[i].colorHSL[0]
          if (!usedHues.some((hue) => (hue + hueBucketRadius) > currentHue && (hue - hueBucketRadius) < currentHue)) {
            selectedColors.push(ImageAnalyzerService.GetFormattedColor(this.allColors[i]))
            usedHues.push(currentHue)

            if (selectedColors.length >= selectedColorLimit) {
              break
            }
          }
        }

        let styleString = 'background-image: linear-gradient(to right, '
        selectedColors.forEach((color: string, idx: number) => {
          const startPct = idx * 100 / selectedColors.length
          const endPct = (idx + 1) * 100 / selectedColors.length

          styleString += `${color} ${startPct}%, ${color} ${endPct}%` + (idx === selectedColors.length - 1 ? '' : ', ')
        })

        styleString += '); height: 20px; width: 100%; margin-top: 5px;'
        
        return styleString
      }
    },
    displayedColors(): ColorData[] {
      return this.showAllColors ? this.allColors : this.allColors.slice(0, 100)
    },
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
}
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
