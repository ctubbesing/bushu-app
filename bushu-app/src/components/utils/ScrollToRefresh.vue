<template>
  <div
    :class="[
      'refresh-div',
      { 'refreshing': isLoading }
    ]"
  >
    <b-icon
      icon="hexagon"
      font-scale="2"
      :animation="isLoading ? 'spin' : ''"
      class="loading-icon"
    />
    <div style="position: absolute; bottom: -20px">
      {{ scrollVal }}
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
  name: 'ScrollToRefresh',
  props: {
    isLoading: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  data() {
    return {
      doRefresh: false as boolean,
      scrollVal: 0 as number,
      // refreshTrigger: '' as string,
      // loading: false as boolean,
    }
  },
  created () {
    window.addEventListener('scroll', this.handleScroll);
  },
  destroyed () {
    window.removeEventListener('scroll', this.handleScroll);
  },
  watch: {
    async doRefresh() {
      if (this.doRefresh) {
        window.scrollTo(0, 0)
        const refreshKey = Date.now().toString()
        this.$emit('refresh', refreshKey)
      }
    },
  },
  methods: {
    handleScroll() {
      this.doRefresh = window.scrollY < -70
      this.scrollVal = window.scrollY
    },
  },
})
</script>

<style scoped>
.refresh-div {
  position: relative;
  height: 70px;
  margin-top: -70px;
  /* margin-bottom: 45px; */
  /* height: auto; */
  /* transition: height 0.25s; */
  background-color: #f00;

  display: flex;
  align-items: center;
}
.refresh-div.refreshing {
  /* height: 60px; */
  margin-top: 0;
  background-color: #0f0;
}
.loading-icon {
  /* position: absolute; */
  /* left: 0;
  right: 0; */
  /* margin-top: -60px; */
  margin: auto;
  /* margin-right: auto; */
}
</style>
