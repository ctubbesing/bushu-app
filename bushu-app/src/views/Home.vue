<template>
  <div class="home">
    <img
      src="@/assets/b314_icon_inner.svg"
      alt="bushu314 logo"
      style="margin-top: 50px; max-width: 250px"
    />
    <widget-list
      :refreshTrigger="refreshTrigger"
    />
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import WidgetList from "@/components/WidgetList.vue";

export default Vue.extend({
  name: "Home",
  components: {
    widgetList: WidgetList,
  },
  data() {
    return {
      doRefresh: false as boolean,
      refreshTrigger: '' as string
    };
  },
  created () {
    window.addEventListener('scroll', this.handleScroll);
  },
  destroyed () {
    window.removeEventListener('scroll', this.handleScroll);
  },
  watch: {
    doRefresh() {
      if (this.doRefresh) {
        this.refreshTrigger = Date.now().toString()
      }
    },
  },
  methods: {
    handleScroll() {
      this.doRefresh = window.scrollY < -50
    },
  },
});
</script>

<style scoped>
</style>