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
          <b-nav-item to="/about">About</b-nav-item>
          <b-nav-item to="/raytracer">Ray Tracer</b-nav-item>
        </b-navbar-nav>
        <b-navbar-nav class="ml-auto">
          <dropbox-sign-in :isSignedIn="isSignedIn" />
        </b-navbar-nav>
      </b-collapse>
    </b-navbar>
    <div style="height: 50px; width: 100%" />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import DropboxSignIn from './DropboxSignIn.vue'
export default Vue.extend({
  components: { DropboxSignIn },
  name: 'Header',
  data() {
    return {
      isSignedIn: false as boolean,
    }
  },
})
</script>
