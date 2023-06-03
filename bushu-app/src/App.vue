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
    // update access and refresh tokens if login redirect
    await this.handleOauthRedirect()
  },
  methods: {
    async handleOauthRedirect() {
      // if code query parameter and code_verifier cookie exist, handle as a Dropbox OAuth redirect
      const params = new URLSearchParams(window.location.search)
      const authorizationCode = params.get('code')
      const codeVerifier = this.$cookies.get('code_verifier')
      if (authorizationCode !== null && codeVerifier !== null) {
        this.$cookies.remove('code_verifier')

        const tokenData = await dropbox.handleDropboxOAuthRedirect(authorizationCode, codeVerifier)
        if (tokenData.refresh_token) {
          this.$cookies.set('db_refresh', tokenData.refresh_token)
        } else {
          this.$cookies.remove('db_refresh')
        }

        this.$store.dispatch('updateAccessToken', tokenData.access_token)
        await this.$store.dispatch('loadUserInfo')
      }
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
