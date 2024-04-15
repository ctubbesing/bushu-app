<template>
  <div
    id="refreshDiv"
    :class="[
      'refresh-div',
      { 'refreshing': isLoading }
    ]"
  >
    <div
      id="expander"
      :class="{ 'refreshing': isLoading }"
    >
        <!-- class="loading-icon" -->
      <loading-icon
        :class="[
          'loading-icon',
          { 'refreshing': isLoading }
        ]"
        :is-loading="isLoading"
        :height-px="isLoading ? 80 : 55"
      />
    </div>
    <!-- <div
      id="expander"
      :class="{ 'refreshing': testLoading }"
    ></div>
    <loading-icon
      class="loading-icon"
      :is-loading="testLoading"
      :height-px="testLoading ? 80 : 55"
    /> -->
    <!-- <div>
      <button @click="testLoading = !testLoading" style="width: 100px">
        Loading: {{ testLoading ? 'On' : 'Off' }}
      </button>
    </div> -->
    <div style="position: absolute; bottom: -70px">
      {{ scrollVal }}<br>
    </div>
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
      testLoading: true as boolean,
      scrollVal: 0,
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
      this.scrollVal = window.scrollY

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
  position: absolute;
  top: 0;
  height: 57px;
  width: 100%;
  /* margin-top: 0; */
  /* margin-top: -57.4125px; */
  /* margin-bottom: 45px; */
  /* height: auto; */
  /* transition: height 0.25s; */
  /* background-color: #f00; */

  /* display: flex; */
  /* align-items: center; */
}
.refresh-div.refreshing {
  /* height: 60px; */
  /* margin-top: 0; */
  /* background-color: rgb(0, 110, 255); */
}
/* .refresh-div.refreshing > .loading-icon {
  top: 70px;

} */
.loading-icon {
  /* position: fixed;
  top: 0px; */
  height: 55px;
  /* width: 42.3076923px; */
  /* max-width: 50px; */
  /* max-height: 100%; */
  /* position: absolute; */
  /* left: 0;
  right: 0; */
  /* margin-top: -60px; */
  margin: 0 auto;
  /* margin-right: auto; */
  /* transition: top 0.5s; */
  transition: height 0.5s 0.3s;
  /* transition: width 0.5s 1s; */
}
.loading-icon.refreshing {
  height: 90px;
  transition: height 0.5s;
  /* width: 69.2307692px; */
  /* height: 70px;
  width: 53.8461538px; */
}
#expander {
  padding-top: 0;
  transition: padding-top 0.5s 0.3s;
  background-color: #9dea;
}
#expander.refreshing {
  padding-top: 70px;
  transition: padding-top 0.5s;
}
</style>
