<template>
  <div id="app">
    <div id="nav">
      <app-header @refresh="handleRefresh" />
    </div>
    <div
      id="overlay"
      v-if="$store.state.isLoading"
      style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: #0004"
    />
    <router-view :refreshKey="refreshKey" />
  </div>
</template>

<script lang="ts">
import Vue from "vue"
import Header from "@/components/utils/Header.vue"
import dropbox from '@/utils/dropbox'

export default Vue.extend({
  name: "App",
  components: {
    AppHeader: Header,
  },
  data() {
    return {
      refreshKey: '' as string
    }
  },
  async created() {
    this.$store.dispatch('updateIsLoading', true)

    await this.initializeDropbox()

    this.$store.dispatch('updateIsLoading', false)
  },
  methods: {
    handleRefresh(event: any) {
      this.refreshKey = event
      // alert('Refresh detected !!')
      // alert(event)
    },
    async initializeDropbox() {
      // update access and refresh tokens if login redirect
      let isRedirect = await this.tryHandleOauthRedirect()

      // attempt to log in with tokens
      if (!isRedirect) {
        await dropbox.tryRefreshAccessToken()
      }

      // load user settings and data from Dropbox if logged in
      if (this.$store.state.dropbox.db_accessToken) {
        await dropbox.reloadAll()
      } else {
        // set up default settings if not logged in
        let widgetList = [
          'wanikani',
          'test',
        ]

        this.$store.dispatch('updateUserWidgets', widgetList)
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
