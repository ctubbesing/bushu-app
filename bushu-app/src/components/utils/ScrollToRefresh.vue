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
      <loading-icon
        :class="[
          'loading-icon',
          { 'refreshing': isLoading }
        ]"
        :is-loading="isLoading"
        :height-px="isLoading ? 80 : 55"
      />
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
    }
  },
  created () {
    window.addEventListener('scroll', this.handleScroll)
  },
  destroyed () {
    window.removeEventListener('scroll', this.handleScroll)
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
    },
  },
})
</script>

<style scoped>
.refresh-div {
  position: absolute;
  top: 0;
  height: 57px;
  width: 100%;
}
.loading-icon {
  height: 55px;
  margin: 0 auto;
  transition: height 0.5s 0.3s;
}
.loading-icon.refreshing {
  height: 90px;
  transition: height 0.5s;
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
