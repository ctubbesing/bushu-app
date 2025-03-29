<template>
  <div id="app">
    <div id="nav">
      <!-- <app-header /> -->
    </div>
    <router-view />
  </div>
  <!-- <v-app>
    <v-app-bar></v-app-bar>
  </v-app> -->
</template>

<script lang="ts">
// import Header from "@/components/utils/Header.vue"
import dropbox from '@/utils/dropbox'
import { mapStores } from 'pinia'
import { useHomeStore } from './stores/home';
import { useDropboxStore } from './stores/dropbox';

export default {
  name: "App",
  components: {
    // AppHeader: Header,
  },
  computed: {
    ...mapStores(useHomeStore, useDropboxStore)
  },
  async created() {
    this.homeStore.updateIsLoading(true)
    
    await this.initializeDropbox()
    
    this.homeStore.updateIsLoading(false)
  },
  methods: {
    async initializeDropbox() {
      // update access and refresh tokens if login redirect
      let isRedirect = await this.tryHandleOauthRedirect()

      // attempt to log in with tokens
      if (!isRedirect) {
        await dropbox.tryRefreshAccessToken()
      }

      // load user settings and data from Dropbox if logged in
      if (this.dropboxStore.isReady) {
        await dropbox.reloadAll()
      } else {
        // set up default settings if not logged in
        let widgetList = [
          'wanikani',
          'test',
        ]

        this.homeStore.updateUserWidgets(widgetList)
      }
    },
    async tryHandleOauthRedirect(): Promise<boolean> {
      // if code query parameter and code_verifier cookie exist, handle as a Dropbox OAuth redirect
      const params = new URLSearchParams(window.location.search)
      const authorizationCode = params.get('code')
      const codeVerifier = this.$cookies.get('code_verifier')
      this.$cookies.remove('code_verifier')

      if (authorizationCode !== null && codeVerifier !== null) {
        await dropbox.handleDropboxOAuthRedirect(authorizationCode, codeVerifier)
        return true
      }
      return false
    },
  },
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
</style>
