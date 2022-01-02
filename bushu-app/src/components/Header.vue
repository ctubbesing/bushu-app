<template>
  <!-- <div> -->
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
  <!-- </div> -->
</template>

<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
  name: 'Header',
})
</script>

<style scoped>
.navbar {
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
}
</style>