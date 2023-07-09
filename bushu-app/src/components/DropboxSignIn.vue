<template>
  <div>
    <div
      class="sign-in-button"
      @click="openModal()"
    >
      <b-spinner
        v-if="$store.state.isLoading"
        variant="secondary"
        style="margin: 5px"
      />
      <div v-else-if="isSignedIn">
        <b-avatar
          style="margin-right: 10px"
          :src="imgLink"
        />
        Hi {{ userShortName }}
        <!-- TODO: add logout option to clear access & refresh tokens -->
      </div>
      <div v-else>
        Sign in with Dropbox
      </div>
    </div>
    <b-modal
      id="loginModal"
      title="Dropbox Sign In"
      hide-footer
      centered
    >
      <div class="sign-in-modal-content">
        <p v-if="isSignedIn">
          Currently signed in as {{ userFullName }}.
        </p>
        <p v-else>
          Sign in with your Dropbox account to be able to
          load and save custom user data and settings.
        </p>
        <div>
          <b-form-checkbox
            v-if="!isSignedIn"
            v-model="doRememberMe"
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
            v-if="isSignedIn"
            @click="signOut()"
            variant="danger"
          >
            Disconnect Account
          </b-button>
          <b-button
            v-else
            @click="openSignInScreen()"
            variant="success"
          >
            Sign In
          </b-button>
        </div>
      </div>
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
      doRememberMe: false as boolean,
    }
  },
  computed: {
    isSignedIn(): boolean {
      return this.$store.getters.db_isLoggedIn
    },
    userShortName(): string {
      return this.$store.state.dropbox.db_userInfo.name.familiar_name
    },
    userFullName(): string {
      return this.$store.state.dropbox.db_userInfo.name.display_name
    },
    imgLink(): string {
      return this.$store.state.dropbox.db_userInfo.profile_photo_url
    },
  },
  methods: {
    openModal() {
      this.$bvModal.show('loginModal')
    },
    closeModal() {
      this.$bvModal.hide('loginModal')
    },
    signOut() {
      dropbox.disconnectAccount()
      this.closeModal()
    },
    async openSignInScreen() {
      await dropbox.authorizeWithDropbox(this.doRememberMe)
      this.closeModal()
    },
  },
})
</script>

<style scoped>
.sign-in-button {
  display: flex;
  justify-content: center;
  align-items: center;
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
.sign-in-button > div {
  display: inline-flex;
  align-items: center;
  padding: 5px;
}
.sign-in-modal-content {
  text-align: center;
}
.sign-in-modal-content button {
  margin: 5px;
}
</style>
