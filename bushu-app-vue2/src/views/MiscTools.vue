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
        <b-tab title="Curve Creator">
          <curve-creator />
        </b-tab>
        <b-tab title="Sandbox">
          <sandbox-game />
        </b-tab>
        <!-- <b-tab title="TouchDragCanvasTest">
          <TouchDragCanvasTest />
        </b-tab> -->
      </b-tabs>
    </b-card>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import ImageAnalyzer from '@/components/miscTools/ImageAnalyzer/ImageAnalyzer.vue'
import CanvasTest from '@/components/CanvasTest.vue'
import CurveCreator from '@/components/miscTools/CurveCreator.vue'
import SandboxGame from '@/components/miscTools/SandboxGame.vue'
// import TouchDragCanvasTest from '@/components/miscTools/TouchDragCanvasTest.vue'

export default Vue.extend({
  name: "MiscTools",
  components: {
    canvasTest: CanvasTest,
    imageAnalyzer: ImageAnalyzer,
    curveCreator: CurveCreator,
    sandboxGame: SandboxGame,
  },
});
</script>
