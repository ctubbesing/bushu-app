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
    <b-navbar type="dark" variant="secondary">
      <b-navbar-nav>
        <b-nav-item href="#/">Home</b-nav-item>
        <b-nav-item href="#/images">About</b-nav-item>

        <!-- Navbar dropdowns -->
        <b-nav-item-dropdown text="Lang" right>
          <b-dropdown-item href="#">EN</b-dropdown-item>
          <b-dropdown-item href="#">ES</b-dropdown-item>
          <b-dropdown-item href="#">RU</b-dropdown-item>
          <b-dropdown-item href="#">FA</b-dropdown-item>
        </b-nav-item-dropdown>

        <b-nav-item-dropdown text="User" right>
          <b-dropdown-item href="#">Account</b-dropdown-item>
          <b-dropdown-item href="#">Settings</b-dropdown-item>
        </b-nav-item-dropdown>
      </b-navbar-nav>
    </b-navbar>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
  name: 'Header',
})
</script>

<style scoped>
/* .navbar {
  position: fixed !important;
  top: 0px;
  margin: 0;
  padding: 0;
  display: flex;
  height: 50px;
  background-color: #378;
}
.navbar > li {
  background-color: green;
  list-style-type: none;
  margin: 0px;
} */
</style>