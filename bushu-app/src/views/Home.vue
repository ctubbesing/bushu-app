<template>
  <div class="home">
    <img
      src="@/assets/b314_icon_inner.svg"
      alt="bushu314 logo"
      style="margin-top: 50px; max-width: 250px"
    />
    <div class="all-widgets">
      <basic-widget
        v-for="num in 5"
        :key="num"
      >
        <template v-slot:header>
          Test Widget {{ num }}
        </template>
        <div>
          test content a
        </div>
        <div>
          test content b
        </div>
        <b-button>Test Button</b-button>
      </basic-widget>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import BasicWidget from "@/components/BasicWidget.vue"

export default Vue.extend({
  name: "Home",
  components: {
    BasicWidget: BasicWidget,
  },
});
</script>

<style scoped>
.all-widgets {
  margin: 20px;
  padding: 10px;
  border-radius: 10px;
  background-color: #fff5;
}
</style>