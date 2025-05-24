<template>
  <v-card class="ma-2">
    <v-tabs v-model="tab">
      <v-tab
        v-for="c in components"
        :key="c.id"
        :text="c.name"
        :value="c.id"
      />
    </v-tabs>

    <v-card-text>
      <v-tabs-window 
        v-model="tab"
        class="pa-1"
      >
        <v-tabs-window-item
          v-for="c in components"
          :key="c.id"
          :value="c.id"
        >
          <component
            :is="c.component"
            v-bind="c.props"
          />
        </v-tabs-window-item>
      </v-tabs-window>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import CanvasTest from '@/components/gallery/CanvasTest.vue'
import DropletWrapper from '@/components/gallery/DropletWrapper.vue'
import ImageAnalyzer from '@/components/gallery/ImageAnalyzer/ImageAnalyzer.vue'
import SandboxGame from '@/components/gallery/SandboxGame.vue'
import { ref } from 'vue'

const tab = ref(null)

type ComponentSummary = {
  id: string
  name: string
  component: any
  props?: object
}

const components: ComponentSummary[] = [
  {
    id: 'dropletRing',
    name: 'Droplet Ring',
    component: DropletWrapper,
  },
  {
    id: 'sandbox',
    name: 'Sandbox',
    component: SandboxGame,
  },
  {
    id: 'imageAnalyzer',
    name: 'Image Analyzer',
    component: ImageAnalyzer,
  },
  {
    id: 'rayTracer',
    name: 'Ray Tracer',
    component: CanvasTest,
  },
  // alethi thing
  // ...
]
</script>
