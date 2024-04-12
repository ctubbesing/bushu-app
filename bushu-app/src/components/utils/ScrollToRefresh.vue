<template>
  <div
    id="refreshDiv"
    :class="[
      'refresh-div',
      { 'refreshing': isLoading }
    ]"
  >
    <!-- <b-icon
      icon="hexagon"
      font-scale="2"
      :animation="isLoading ? 'spin' : ''"
      class="loading-icon"
    /> -->
    <loading-icon
      class="loading-icon"
      :is-loading="isLoading"
    />
    <!-- <button @click="testLoading = !testLoading">{{ testLoading ? '1' : '0' }} toggle loading</button> -->
    <!-- <div style="position: absolute; bottom: -70px">
      {{ scrollVal }}<br>
    </div> -->
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import LoadingIcon from '@/components/utils/LoadingIcon.vue'
export default Vue.extend({
  name: 'ScrollToRefresh',
  components: { LoadingIcon },
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
      // testLoading: false as boolean,
    }
  },
  created () {
    window.addEventListener('scroll', this.handleScroll)
    // document.body.addEventListener('touchmove', this.disableFingerScroll, { passive: false })
  },
  destroyed () {
    window.removeEventListener('scroll', this.handleScroll)
    // window.removeEventListener('touchmove', this.disableFingerScroll)
  },
  watch: {
    async doRefresh() {
      if (this.doRefresh) {
        const refreshKey = Date.now().toString()
        this.$emit('refresh', refreshKey)
      }
    },
  },
  methods: {
    handleScroll() {
      this.doRefresh = window.scrollY < -70
      // this.scrollVal = window.scrollY

      // console.log('a')

      // if (this.isLoading) {
      //   let e = document.getElementById('refreshDiv')
      //   // console.log(e)
      //   if (e) {
      //     // console.log('asdf')/
      //     e.style.backgroundColor = '#00f'
      //     if (e.style.marginTop.substring(0, 1) === '-') {
      //       e.style.marginTop = window.scrollY + ''
      //     }
      //   }
      //   // e.preventDefault()
      //   // window.scrollTo(0, 0)
      // }
    },
    // disableFingerScroll(e: any) {
    //   this.touchCounter += 1
    //   let currentCount = this.touchCounter
    //   this.isTouchScrolling = true
    //   if (this.isLoading) {
    //     e.preventDefault()
    //   }

    //   this.$nextTick(() => {
    //     if (currentCount === this.touchCounter) {
    //       this.isTouchScrolling = false
    //       this.touchCounter = 0
    //     }
    //   })
    // },
  },
})
</script>

<style scoped>
.refresh-div {
  position: relative;
  height: 70px;
  /* margin-top: 0; */
  margin-top: -70px;
  /* margin-bottom: 45px; */
  /* height: auto; */
  /* transition: height 0.25s; */
  /* background-color: #f00; */

  display: flex;
  align-items: center;
}
.refresh-div.refreshing {
  /* height: 60px; */
  /* margin-top: 0; */
  background-color: #0f0;
}
.loading-icon {
  /* max-width: 50px; */
  max-height: 100%;
  /* position: absolute; */
  /* left: 0;
  right: 0; */
  /* margin-top: -60px; */
  margin: 0 auto;
  /* margin-right: auto; */
}
</style>
