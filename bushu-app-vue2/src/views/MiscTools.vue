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
        <!-- <b-tab title="Curve Creator">
          <curve-creator />
        </b-tab> -->
        <b-tab title="Sandbox">
          <sandbox-game />
        </b-tab>
        <b-tab title="Droplet Ring">
          <b-form-spinbutton
            v-model="dropletCount"
            min="2"
            max="10"
            wrap
            inline
            style="margin:10px;"
          />
          <droplet-ring
            :n="dropletCount"
            style="max-width: 500px;"
          />
        </b-tab>
      </b-tabs>
    </b-card>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import ImageAnalyzer from '@/components/miscTools/ImageAnalyzer/ImageAnalyzer.vue'
import CanvasTest from '@/components/CanvasTest.vue'
// import CurveCreator from '@/components/miscTools/CurveCreator.vue'
import SandboxGame from '@/components/miscTools/SandboxGame.vue'
import DropletRing from '@/components/miscTools/DropletRing.vue'

export default Vue.extend({
  name: "MiscTools",
  components: {
    canvasTest: CanvasTest,
    imageAnalyzer: ImageAnalyzer,
    // curveCreator: CurveCreator,
    sandboxGame: SandboxGame,
    dropletRing: DropletRing,
  },
  data() {
    return {
      dropletCount: 3,
    }
  },
});
</script>
