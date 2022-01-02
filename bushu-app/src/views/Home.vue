<template>
  <div class="home">
    <img
      src="../assets/b314_icon_inner.svg"
      alt="bushu314 logo"
      style="max-width: 300px"
    />
    <HelloWorld msg="Welcome to BushuApp" />
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import HelloWorld from "@/components/HelloWorld.vue"; // @ is an alias to /src

export default Vue.extend({
  name: "Home",
  components: {
    HelloWorld,
  },
});
</script>
