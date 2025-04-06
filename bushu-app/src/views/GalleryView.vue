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
      <v-tabs-window v-model="tab">
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
import DropletWrapper from '@/components/gallery/DropletWrapper.vue'
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
  // canvasTest
  // imageAnalyzer
  // alethi thing
  // ...
]
</script>
