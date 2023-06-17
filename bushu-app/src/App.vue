<template>
  <div id="app">
    <div id="nav">
      <app-header />
    </div>
    <router-view />
  </div>
</template>

<script lang="ts">
import Vue from "vue"
import Header from "@/components/Header.vue"
import dropbox from '@/utils/dropbox'

export default Vue.extend({
  name: "App",
  components: {
    AppHeader: Header,
  },
  async created() {
    await this.initializeDropbox()
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
      if (this.$store.state.dropbox.db_accessToken) {
        // basic user info
        await dropbox.loadUserInfo()

        // widget list settings
        const tempWidgetList = [
          'wanikani',
          'test',
        ]
        this.$store.dispatch('updateUserWidgets', tempWidgetList)
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
});
</script>

<style>
body {
  background-color: #9de !important;
}
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
</style>
