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
    await this.handleOauthRedirect()
  },
  methods: {
    async handleOauthRedirect() {
      // if code query parameter and code_verifier cookie exist, handle as a Dropbox OAuth redirect
      const authorizationCode = this.$route.query.code
      const codeVerifier = this.$cookies.get('code_verifier')
      if (authorizationCode !== undefined && typeof authorizationCode === 'string' && codeVerifier !== null) {
        this.$router.replace({ query: undefined })
        this.$cookies.remove('code_verifier')

        const accessToken = await dropbox.handleDropboxOAuthRedirect(authorizationCode, codeVerifier)

        this.$store.dispatch('updateAccessToken', accessToken)
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
