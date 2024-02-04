<template>
  <div>
    <b-navbar
      toggleable="lg"
      fixed="top"
      type="dark"
      variant="secondary"
    >
      <b-navbar-brand to="/">
        <img
          src="@/assets/b_favicon.svg"
          alt="B icon"
          style="height: 30px"
        />
        BushuApp
      </b-navbar-brand>
      <b-navbar-toggle target="headerOptions" />
      <b-collapse id="headerOptions" is-nav>
        <b-navbar-nav>
          <b-nav-item to="/">Home</b-nav-item>
          <!-- <b-nav-item to="/about">About</b-nav-item> -->
          <b-nav-item-dropdown text="Apps">
            <b-dropdown-item to="/watchlist">Watchlist</b-dropdown-item>
            <b-dropdown-item to="/raytracer">Ray Tracer</b-dropdown-item>
          </b-nav-item-dropdown>
        </b-navbar-nav>
        <b-navbar-nav class="ml-auto">
          <dropbox-sign-in />
        </b-navbar-nav>
      </b-collapse>
    </b-navbar>
    <div :style="'height: 58px; width: 100%'" />
    <scroll-to-refresh @refresh="$emit('refresh', $event)" />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import DropboxSignIn from '@/components/DropboxSignIn.vue'
import ScrollToRefresh from '@/components/utils/ScrollToRefresh.vue'

export default Vue.extend({
  components: {
    DropboxSignIn,
    ScrollToRefresh,
  },
  name: 'Header',
  data() {
    return {}
  },
})
</script>
