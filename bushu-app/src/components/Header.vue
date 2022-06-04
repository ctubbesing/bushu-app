<template>
  <div>
    <b-navbar
      style="height: 50px"
      fixed="top"
      type="dark"
      variant="secondary"
    >
      <b-navbar-brand href="#/">
        <img
          src="@/assets/b_favicon.svg"
          alt="B icon"
          style="height: 30px"
        />
        BushuApp
      </b-navbar-brand>
      <b-navbar-nav>
        <b-nav-item href="#/">Home</b-nav-item>
        <b-nav-item href="#/about">About</b-nav-item>
        <b-nav-item href="#/raytracer">Ray Tracer</b-nav-item>
      </b-navbar-nav>
    </b-navbar>
    <div style="height: 50px; width: 100%" />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
  name: 'Header',
})
</script>