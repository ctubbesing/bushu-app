<template>
  <v-card class="ma-2">
    <v-tabs>
      <v-tab
        v-for="r in galleryRoutes"
        :key="r.name"
        :text="getRouteTitle(r)"
        :value="r.name"
        :to="r"
      />
    </v-tabs>

    <v-card-text>
      <routerView />
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import router from '@/router'
import { type RouteRecordRaw } from 'vue-router'

const galleryRoutes = router.getRoutes().find(r => r.name === 'gallery')?.children

const getRouteTitle = (route: RouteRecordRaw): string => {
  if (typeof(route.meta?.title) === 'string') {
    return route.meta?.title
  }
  return route.name?.toString() ?? '-'
}
</script>
