<template>
  <div>
    <div
      class="sign-in-button"
      @click="openModal()"
    >
      <div v-if="isSignedIn">
        Hi ur signed in
      </div>
      <div v-else>
        Sign in with Dropbox
      </div>
    </div>
    <b-modal
      id="loginModal"
      title="Sign in with Dropbox"
      hide-footer
    >
      <p>Sign in with Dropbox</p>
      <b-form-checkbox
        v-model="rememberMe"
      >
        Remember Me
      </b-form-checkbox>
      <b-button
        @click="closeModal()"
        variant="outline-secondary"
      >
        Cancel
      </b-button>
      <b-button
        @click="openSignInScreen()"
        variant="success"
      >
        Sign In
      </b-button>
    </b-modal>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  name: 'BasicWidget',
  props: {
    isSignedIn: Boolean,
  },
  data() {
    return {
      rememberMe: false as boolean,
    }
  },
  methods: {
    openModal() {
      this.$bvModal.show('loginModal')
    },
    closeModal() {
      this.$bvModal.hide('loginModal')
    },
    dec2hex(dec: number): string {
      return ('0' + dec.toString(16)).substr(-2)
    },
    generateRandomHexString() {
      var array = new Uint32Array(32);
      window.crypto.getRandomValues(array);
      return Array.from(array, this.dec2hex).join('');
    },
    hexToBase64(hexStr: string): string {
      let hexPairs = hexStr.match(/\w{2}/g)
      if (hexPairs !== null) {
        return btoa(hexPairs.map((a) => {
          return String.fromCharCode(parseInt(a, 16));
        }).join(''))
      }
      return ''
    },
    base64URLEncode(b64str: string): string {
      return b64str.replace(/\+/g, '-')
                   .replace(/\//g, '_')
                   .replace(/=/g, '')
    },
    generateCodeVerifier() {
      return this.base64URLEncode(this.hexToBase64(this.generateRandomHexString()))
    },
    async sha256(str: string): Promise<string> {
      const encoder = new TextEncoder()
      const data = encoder.encode(str)
      let buf = await window.crypto.subtle.digest('SHA-256', data)
      let bytes = new Uint8Array(buf)
      let len = bytes.byteLength
      let resultStr = ''
      for (let i = 0; i < len; i++) {
        resultStr += String.fromCharCode(bytes[i])
      }
      return this.base64URLEncode(btoa(resultStr))
    },
    async openSignInScreen() {
      let codeVerifier: string = this.generateCodeVerifier()
      let codeChallenge: string = await this.sha256(codeVerifier)

      console.log(this.rememberMe ? 'remembering' : 'not remembering')
      console.log('codeVerifier:  ' + codeVerifier)
      console.log('codeChallenge: ' + codeChallenge)

      this.closeModal()
    },
  },
})
</script>

<style scoped>
</style>
