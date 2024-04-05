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
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
  name: 'ScrollToRefresh',
  data() {
    return {
      doRefresh: false as boolean,
      // refreshTrigger: '' as string,
      // loading: false as boolean,
    }
  },
  computed: {
    isLoading(): boolean {
      return this.$store.state.isLoading
    },
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
        // this.loading = true
        const refreshKey = Date.now().toString()
        this.$emit('refresh', refreshKey)
        // await dropbox.reloadAll()///////////////////////////////     emit instead
        // this.loading = false
      }
    },
  },
  methods: {
    handleScroll() {
      this.doRefresh = window.scrollY < -100
    },
  },
})
</script>

<style scoped>
.refresh-div {
  height: auto;
  background-color: green;
}
.refresh-div.refreshing {
  height: 60px;
  background-color: blue;
}
.loading-icon {
  position: absolute;
  left: 0;
  right: 0;
  margin-top: -60px;
  margin-left: auto;
  margin-right: auto;
}
</style>
