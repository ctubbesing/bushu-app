<template>
  <div class="main-body">
    <!-- Header -->
    <div>
      <h3>
        <slot name="header"></slot>
      </h3>
    </div>
    <!-- maybe add options list here -->
    <!-- Body -->
    <div>
      <slot></slot>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  name: 'BasicWidget'
})
</script>

<style scoped>
.main-body {
  display: inline-block;
  margin: 5px;
  padding: 10px;
  background-color: #fff9;
  border-radius: 8px;
}
</style>