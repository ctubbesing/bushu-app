<template>
  <div>
    <nav>
      <ul>
        <li>
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
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
  name: 'Header',
})
</script>