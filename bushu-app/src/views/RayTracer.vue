<template>
  <div class="home">
    <img
      src="@/assets/b314_icon_inner.svg"
      alt="bushu314 logo"
      style="margin-top: 50px; max-width: 250px"
    />
    <canvas-test></canvas-test>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import CanvasTest from "@/components/CanvasTest.vue";

export default Vue.extend({
  name: "RayTracer",
  components: {
    canvasTest: CanvasTest,
  },
  data() {
    return {};
  },
});
</script>

<style>
</style>