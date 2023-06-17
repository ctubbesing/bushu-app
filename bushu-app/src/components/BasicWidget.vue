<template>
  <div class="widget">
    <!-- Header -->
    <div class="header">
      <h3>
        <slot name="header"></slot>
      </h3>
      <b-dropdown
        variant="transparent-secondary"
        style="height:25px; padding-left:50px"
      >
        <b-dropdown-item>Test item 1</b-dropdown-item>
        <b-dropdown-item>Test item 2</b-dropdown-item>
      </b-dropdown>
    </div>
    <!-- maybe add options list here -->
    <!-- Body -->
    <div class="main-body">
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
.widget {
  display: inline-block;
  margin: 5px;
  padding: 10px;
  background-color: #fff9;
  border-radius: 8px;
}
.header {
  height: 45px;
  border-bottom: #ddd solid 1px;
  display: flex;
  justify-content: space-between;
}
.main-body {
  margin-top: 5px;
}
.widget-section {
  display: inline-block;
  margin: 5px;
  padding: 5px;
  background-color: #fff9;
  box-shadow: 0 0px 2px #888;
  border-radius: 5px;
}
</style>