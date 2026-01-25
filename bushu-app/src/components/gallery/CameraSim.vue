<template>
  <div class="comparison-container">
    <div>
      <v-btn
        v-for="urlKey in Object.keys(urls)"
        :key="urlKey"
        class="ma-2"
        @click="loadImage(urls[urlKey as keyof typeof urls])"
      >
        {{ urlKey }}
      </v-btn>
      <div class="image-container">
        <canvas :id="oldCanvasId" />
      </div>
    </div>
    <div>
      <v-btn class="ma-2" @click="editImage"> Analyze </v-btn>
      <div class="image-container">
        <canvas :id="newCanvasId" />
      </div>
    </div>
  </div>
  <CameraSimDiagram
    v-if="selectedUrl && loadedImgWidth"
    :srcUrl="selectedUrl"
    :srcWidth="loadedImgWidth"
    :srcHeight="loadedImgHeight"
  />
</template>

<script lang="ts" setup>
import ImageAnalyzerService, {
  type Pixel
} from '@/utils/miscTools/ImageAnalyzer/ImageAnalyzerService'
import { computed, ref } from 'vue'
import CameraSimDiagram from './CameraSimDiagram.vue'

const urls = {
  dogs: 'https://upload.wikimedia.org/wikipedia/commons/6/69/Dog_morphological_variation.png',
  creeper: 'https://minecraft.wiki/images/thumb/Creeper_Danger.png/735px-Creeper_Danger.png?faaf5'
}

const selectedUrl = ref<string>()
const pixelData = ref<Pixel[][]>([])

const loadedImgWidth = computed((): number => pixelData.value.length ? pixelData.value[0].length : 0)
const loadedImgHeight = computed((): number => pixelData.value.length)

const oldCanvasId = 'testOldCanvasId'
const newCanvasId = 'testNewCanvasId'
const loadImage = async (srcPath: string) => {
  selectedUrl.value = srcPath
  pixelData.value = await ImageAnalyzerService.getPixelData(srcPath, oldCanvasId)
  console.log(
    `pixelData: ${pixelData.value.length ? `${pixelData.value[0].length}x${pixelData.value.length}` : '---'}`
  )
}

const redraw = () => ImageAnalyzerService.putPixelData(newCanvasId, pixelData.value)

const editImage = async () => {
  if (pixelData.value.length === 0) {
    return
  }

  const halfHeight = Math.floor(pixelData.value.length / 2)
  pixelData.value[halfHeight].forEach((p) => {
    p.r = 255
    p.g = 0
    p.b = 0
    p.a = 255
  })

  redraw()
}
</script>

<style scoped>
.comparison-container {
  display: flex;
}
.comparison-container > div {
  width: 50%;
}
.image-container {
  margin: 8px;
  padding: 12px;
  border: 1px solid #334;
}
.image-container > canvas {
  max-height: 300px;
}
#asdffdsafsdf {
  background-image: url('https://minecraft.wiki/images/thumb/Creeper_Danger.png/735px-Creeper_Danger.png?faaf5');
}
</style>
