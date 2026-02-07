<template>
  <v-select
    v-model="selectedProgramName"
    :items="allPrograms"
    class="mx-3 my-2"
    @update:model-value="startProgram"
  />
  <div class="overflow-auto">
    <canvas
      :id="canvasId"
      :width="canvasWidth"
      :height="canvasHeight"
    />
  </div>
</template>

<script lang="ts" setup>
import { useGL, type UseGLContext, type UseGLProgramName } from '@/utils/webGL/useGL'
import { onMounted, onUnmounted, ref } from 'vue'

const canvasId = ref('test-gl-canvas')
const canvasWidth = ref(600)
const canvasHeight = ref(400)

const useGLContext = ref<UseGLContext>()

const allPrograms = ref<{ title: string, value: UseGLProgramName }[]>([
  {
    title: 'Circle - animation practice',
    value: 'circleProg',
  },
  {
    title: 'Ray Marcher',
    value: 'marchProg',
  },
])
const selectedProgramName = ref<UseGLProgramName>('marchProg')

const startProgram = async () => {
  disposeProgram()
  useGLContext.value = await useGL(selectedProgramName.value, canvasId.value)
}

const disposeProgram = () => {
  if (useGLContext.value?.dispose) {
    useGLContext.value?.dispose()
  }
}

onMounted(startProgram)
onUnmounted(disposeProgram)
</script>
