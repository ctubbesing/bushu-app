<template>
  <basic-widget>
    <template v-slot:header>
      <img
        src="https://assets.wanikani.com/assets/logo--retro-colors-a26916b67c16d2015df41458d869bf37151dea58d10bab76d218199b498b4f42.png"
        style="height: 30px"
      >
    </template>
    <!-- Content -->
    <div class="widget-section">
      <div class="lessons-reviews" style="background-color: #ff00aa">
        Lessons: {{ lessonCount }}
      </div>
      <div class="lessons-reviews" style="background-color: #00aaff">
        Reviews: {{ reviewCount }}
      </div>
    </div>
    <b-button href="https://www.wanikani.com">Go to WaniKani</b-button>
  </basic-widget>
</template>

<script lang="ts">
import Vue from 'vue'
import BasicWidget from "@/components/BasicWidget.vue"

export default Vue.extend({
  name: "WanikaniWidget",
  components: {
    BasicWidget: BasicWidget,
  },
  data() {
    return {
      lessonCount: 0 as number,
      reviewCount: 0 as number,
    };
  },
})
</script>

<style scoped>
.lessons-reviews {
  margin: 3px;
  padding: 5px;
  box-shadow: inset 0 -3px 1px rgb(0 0 0 / 20%), inset 0 3px 1px rgb(0 0 0 / 0%);
  color: #fff;
  border-radius: 5px;
  font-family: "Open Sans", "Helvetica Neue", Helvetica, Arial, sans-serif;
  font-size: 18px;
  font-weight: bold;
  /* display: block; */ 
}
</style>