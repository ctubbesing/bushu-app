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
    <div
      v-if="showManualTrigger && !isLoading"
      id="trigger"
    >
      <b-button
        size="sm"
        pill
        variant="outline-danger"
        @click="triggerRefresh"
      >
        Refresh
      </b-button>
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
      showManualTrigger: false as boolean,
    }
  },
  created () {
    window.addEventListener('scroll', this.handleScroll)
  },
  destroyed () {
    window.removeEventListener('scroll', this.handleScroll)
  },
  watch: {
    doRefresh() {
      if (this.doRefresh) {
        this.triggerRefresh()
      }
    },
  },
  methods: {
    handleScroll() {
      this.doRefresh = !this.isLoading && window.scrollY < -70
    },
    triggerRefresh() {
      const refreshKey = Date.now().toString()
      this.$emit('refresh', refreshKey)
    },
  },
})
</script>

<style scoped>
.refresh-div {
  position: fixed;
  top: 0;
  height: 57px;
  width: 100%;
}
.loading-icon {
  height: 55px;
  margin: 0 auto;
  transition: height 0.5s 0.5s;
}
.loading-icon.refreshing {
  height: 90px;
  transition: height 0.5s;
}
#expander {
  padding-top: 0;
  transition: padding-top 0.5s 0.5s;
  background-color: #9dea;
}
#expander.refreshing {
  padding-top: 70px;
  transition: padding-top 0.5s;
}
#trigger {
  padding: 5px;
  text-align: right;
  background-color: #ccc6;
}
</style>
