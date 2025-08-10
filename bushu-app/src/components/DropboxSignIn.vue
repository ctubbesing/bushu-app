<template>
  <v-btn
    icon
    :loading="homeStore.isLoading"
    @click="showModal = true"
  >
    <v-avatar color="app-gray">
      <v-img
        v-if="dropboxStore.userInfo"
        :src="dropboxStore.userInfo.profile_photo_url"
      />
      <v-icon
        v-else
        icon="mdi-account-circle"
      />
    </v-avatar>
  </v-btn>

  <BaseModal
    v-model="showModal"
    :do-ok="false"
    :do-cancel="false"
  >
    <div class="text-center">
      <p v-if="dropboxStore.isLoggedIn">
        Currently signed in as {{ dropboxStore.userInfo?.name.display_name }}.
      </p>
      <p v-else>
        Sign in with your Dropbox account to be able to
        load and save custom user data and settings.
      </p>
      <!-- <div> -->
      <div class="d-inline-block text-center">
        <v-checkbox
          v-if="!dropboxStore.isLoggedIn"
          v-model="doRememberMe"
          label="Remember Me"
        />
      </div>
      <div>
        <v-btn
          v-if="dropboxStore.isLoggedIn"
          @click="signOut"
          variant="elevated"
          color="error"
          class="ma-1"
        >
          Disconnect Account
        </v-btn>
        <v-btn
          v-else
          @click="openSignInScreen"
          variant="elevated"
          color="success"
          class="ma-1"
        >
          Sign In
        </v-btn>
        <v-btn
          @click="closeModal"
          variant="tonal"
          class="ma-1"
        >
          Cancel
        </v-btn>
      </div>
    </div>
    <!-- TODO: add logout option to clear access & refresh tokens -->
  </BaseModal>
</template>

<script lang="ts" setup>
import dropbox from '@/translators/dropbox'
import { useHomeStore } from '@/stores/home'
import { useDropboxStore } from '@/stores/dropbox'
import BaseModal from './utils/BaseModal.vue'
import { ref } from 'vue'

const homeStore = useHomeStore()
const dropboxStore = useDropboxStore()

const showModal = ref(false)

const doRememberMe = ref(false)

const closeModal = () => showModal.value = false

const signOut = () => {
  dropbox.disconnectAccount()
  closeModal()
}

const openSignInScreen = async () => {
  await dropbox.authorizeWithDropbox(doRememberMe.value)
  closeModal()
}
</script>

<style scoped>
.v-checkbox :deep(label) {
  opacity: 1;   
}
</style>
