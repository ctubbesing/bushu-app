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
        console.log('!! handling OAuth redirect')
        console.log('this.$route:')
        console.log(this.$route)
        console.log('authorizationCode:')
        console.log(authorizationCode)
        console.log('codeVerifier:')
        console.log(codeVerifier)
        this.$cookies.remove('code_verifier')
        await dropbox.handleDropboxOAuthRedirect(authorizationCode, codeVerifier)
      } else {
        // issue: redirect url is being formatted as http://localhost:8080/?code=asdf#/ , and the code isn't showing up in $route.query
        // prolly some SPA-specific issue & using a bad redirect_url param rn
        console.log('not an oauth redirect.')
        console.log('this.$route:')
        console.log(this.$route)
        console.log('authorizationCode:')
        console.log(authorizationCode)
        console.log('codeVerifier:')
        console.log(codeVerifier)
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
