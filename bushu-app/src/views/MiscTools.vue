<template>
  <div class="p-3">
    <b-card no-body>
      <b-tabs
        pills
        lazy
        card
      >
        <b-tab
          title="Image Analyzer"
          active
        >
          <image-analyzer />
        </b-tab>
        <b-tab title="Ray Tracer">
          <canvas-test />
        </b-tab>
      </b-tabs>
    </b-card>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import ImageAnalyzer from '@/components/miscTools/ImageAnalyzer/ImageAnalyzer.vue'
import CanvasTest from '@/components/CanvasTest.vue'

export default Vue.extend({
  name: "MiscTools",
  components: {
    canvasTest: CanvasTest,
    imageAnalyzer: ImageAnalyzer,
  },
});
</script>
