<template>
  <!-- <div class="navbar navbar-default navbar-fixed-top">
    <nav>
      <ul class="navbar">
        <li class="nav-tab">
          <router-link to="/">
            Home
          </router-link>
        </li>
        <li>
          <router-link to="/images">
            Images
          </router-link>
        </li>
      </ul>
    </nav>
  </div> -->
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
        <b-nav-item href="#/images">About</b-nav-item>
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