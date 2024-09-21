<template>
  <div class="widget">
    <!-- Header -->
    <div class="header">
      <h3>
        <slot name="header"></slot>
      </h3>
      <base-dropdown
        :options="options"
        style="padding-left: 50px"
      />
    </div>
    <!-- Body -->
    <div class="main-body">
      <slot></slot>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { BaseDropdownOption } from '@/components/utils/types/baseTypes'

defineProps({
  options: {
    type: Array as () => BaseDropdownOption[],
    required: false,
    default: () => [
      { title: "Test item 1" },
      { title: "Test item 2" },
    ],
  },
})
</script>

<style scoped>
.widget {
  display: inline-block;
  margin: 5px;
  padding: 10px;
  background-color: #fff9;
  border-radius: 8px;
  max-width: 500px;
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
:slotted(.widget-section) {
  flex-grow: 1;
  display: inline-block;
  margin: 5px;
  padding: 5px;
  background-color: #fff9;
  box-shadow: 0 0px 2px #888;
  border-radius: 5px;
  min-width: 150px;
}
</style>