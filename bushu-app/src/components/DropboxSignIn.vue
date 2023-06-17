<template>
  <div>
    <div
      class="sign-in-button"
      @click="openModal()"
    >
      <b-spinner
        v-if="$store.state.isLoading"
        variant="secondary"
        small
      />
      <div v-else-if="isSignedIn">
        Hi {{ userName }}
        <!-- TODO: add logout option to clear access & refresh tokens -->
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
      <p>Sign in to load custom user data</p>
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
import dropbox from '@/utils/dropbox'

export default Vue.extend({
  name: 'BasicWidget',
  data() {
    return {
      rememberMe: false as boolean,
    }
  },
  computed: {
    isSignedIn(): boolean {
      return this.$store.state.dropbox.db_userInfo !== null
    },
    userName(): string {
      return this.$store.state.dropbox.db_userInfo.name.familiar_name
    },
  },
  methods: {
    openModal() {
      this.$bvModal.show('loginModal')
    },
    closeModal() {
      this.$bvModal.hide('loginModal')
    },
    async openSignInScreen() {
      await dropbox.authorizeWithDropbox(this.rememberMe)
      this.closeModal()
    },
  },
})
</script>

<style scoped>
.sign-in-button {
  background-color: #F7F5F2;
  color: #1E1919;
  /* font-family: "Atlas Grotesk"; */
  padding: 1px 4px;
  cursor: pointer;
  border-radius: 5px;
}
.sign-in-button:hover {
  background-color: #E8E4DC;
  box-shadow: 0 0 0 2px #0061FE;
}
</style>
