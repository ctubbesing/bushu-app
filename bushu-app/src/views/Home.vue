<template>
  <div class="home">
    <!-- <b-icon
      icon="hexagon"
      font-scale="2"
      :animation="loading ? 'spin' : ''"
      class="loading-icon"
    /> -->
    <img
      src="@/assets/b314_icon_inner.svg"
      alt="bushu314 logo"
      style="margin-top: 50px; max-width: 250px"
    />
    <widget-list
      :refreshTrigger="refreshKey"
    />
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import WidgetList from "@/components/WidgetList.vue";
import dropbox from "@/utils/dropbox";

export default Vue.extend({
  name: "Home",
  components: {
    widgetList: WidgetList,
  },
  props: {
    refreshKey: {
      type: String,
      required: false,
      default: '',
    },
  },
  data() {
    return {
      // doRefresh: false as boolean,
      refreshTrigger: '' as string,
      // loading: false as boolean,
    }
  },
  // created () {
  //   window.addEventListener('scroll', this.handleScroll);
  // },
  // destroyed () {
  //   window.removeEventListener('scroll', this.handleScroll);
  // },
  // watch: {
  //   async doRefresh() {
  //     if (this.doRefresh) {
  //       this.loading = true
  //       this.refreshTrigger = Date.now().toString()
  //       await dropbox.reloadAll()
  //       this.loading = false
  //     }
  //   },
  // },
  // methods: {
  //   handleScroll() {
  //     this.doRefresh = window.scrollY < -50
  //   },
  // },
});
</script>

<style scoped>
/* .loading-icon {
  position: absolute;
  left: 0;
  right: 0;
  margin-top: -50px;
  margin-left: auto;
  margin-right: auto;
} */
</style>