<template>
  <v-app-bar
    color="app-header"
    elevation="2"
  >
    <template #prepend>
      <v-app-bar-nav-icon @click="showDrawer = !showDrawer" />
    </template>

    <!-- to="home" -->
    <v-app-bar-title
      class="text-left"
    >
      <div class="d-flex align-items-center">
        <img
          src="@/assets/b_favicon.svg"
          alt="B icon"
          class="mr-2"
          style="height: 30px"
        />
        BushuApp
      </div>
    </v-app-bar-title>

    <DropboxSignIn />
  </v-app-bar>

  <v-navigation-drawer
    v-model="showDrawer"
    color="app-header"
  >
    <v-list nav>
      <v-list-item
        prepend-icon="mdi-home"
        title="Home"
        :to="{ name: 'home' }"
      />
      <v-divider />
      <!-- :to="{ name: 'watchlist' }" -->
      <v-list-item
        prepend-icon="mdi-television-guide"
        title="Watchlist"
      />
      <v-list-item
        prepend-icon="mdi-collage"
        title="Gallery"
        :to="{ name: 'gallery' }"
      />
    </v-list>
    <v-list nav>
      <v-divider />
      <v-list-item
        class="align-self-end"
        prepend-icon="mdi-theme-light-dark"
        @click="toggleTheme"
      />
    </v-list>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import { toggleTheme } from '@/plugins/vuetify'
import { ref } from 'vue'
import DropboxSignIn from './DropboxSignIn.vue'

const showDrawer = ref(false)
</script>

<style scoped>
:deep(.v-navigation-drawer__content) {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
</style>
