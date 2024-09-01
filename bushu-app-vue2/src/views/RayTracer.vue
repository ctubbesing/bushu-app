<template>
  <div>
    <canvas-test />
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