<template>
  <div class="base-dropdown-main">
    <v-icon
      :id="dropdownId"
      icon="mdi-menu-down"
      style="cursor: pointer"
    />
    <v-menu
      :activator="'#' + dropdownId"
      location="bottom right"
    >
      <v-list density="compact">
        <v-list-item
          v-for="(item, idx) in options"
          :key="idx"
          :title="item.title"
          :disabled="!!item.disabled"
          @click="selectItem(item)"
        />
      </v-list>
    </v-menu>
  </div>
</template>

<script lang="ts" setup>
import { VIcon, VList, VListItem, VMenu } from 'vuetify/components'
import type { BaseDropdownOption } from './types/baseTypes'

defineProps({
  options: {
    type: Array as () => BaseDropdownOption[],
    required: true,
  },
})

const dropdownId: string = 'dropdown-' + new Date().valueOf()

const selectItem = (item: BaseDropdownOption) => {
  if (item.clickEvent) {
    item.clickEvent()
  }
}
</script>

<style scoped>
.base-dropdown-main {
  display: inline-block;
}
::v-deep.v-list {
  padding: 0
}
</style>