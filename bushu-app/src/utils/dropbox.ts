import Vue from "vue"
import axios from "axios"
import store from "@/store"
import tools from "@/utils/tools"
import { TokenResponse } from "@/types/dropboxTypes"

const vm = Vue.prototype
const db_app_client_id = 'q9aarn0najvippt'
const redirect_uri = window.location.origin + process.env.BASE_URL

function getBearerToken(): string {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return `Bearer ${(store.state.dropbox.db_accessToken === '') ? 'invalidToken' : store.state.dropbox.db_accessToken}`
}

export default {
  // step 1 of PKCE authorization code flow
  async authorizeWithDropbox(doRememberMe: boolean) {
    const codeVerifier = tools.generateCodeVerifier()
    const codeChallenge = await tools.sha256(codeVerifier)
    vm.$cookies.set('code_verifier', codeVerifier, 300)

    const authorizationURL = `https://www.dropbox.com/oauth2/authorize` +
                              `?client_id=${db_app_client_id}` +
                              `&redirect_uri=${encodeURIComponent(redirect_uri)}` +
                              `&code_challenge_method=S256` +
                              `&code_challenge=${codeChallenge}` +
                              (doRememberMe ? `&token_access_type=offline` : '') +
                              `&response_type=code`

    window.location.replace(authorizationURL)
  },

  // step 2 of PKCE authorization code flow
  async handleDropboxOAuthRedirect(authorizationCode: string, codeVerifier: string) {
    const tokenRequestURL = `https://api.dropbox.com/oauth2/token` +
                            `?client_id=${db_app_client_id}` +
                            `&redirect_uri=${encodeURIComponent(redirect_uri)}` +
                            `&code_verifier=${codeVerifier}` +
                            `&code=${authorizationCode}` +
                            `&grant_type=authorization_code`
    
    const response = await axios.post(tokenRequestURL)
    const tokenData: TokenResponse = response.data

    if (tokenData.refresh_token) {
      vm.$cookies.set('db_refresh', tokenData.refresh_token)
    } else {
      vm.$cookies.remove('db_refresh')
    }

    store.dispatch('updateAccessToken', tokenData.access_token)
  },

  // refresh access token with refresh token if available
  async tryRefreshAccessToken(): Promise<boolean> {
    const refreshToken: string = vm.$cookies.get('db_refresh')
    if (refreshToken) {
      const tokenRequestURL = `https://api.dropbox.com/oauth2/token` +
                              `?client_id=${db_app_client_id}` +
                              `&refresh_token=${refreshToken}` +
                              `&grant_type=refresh_token`
      try {
        const response = await axios.post(tokenRequestURL)
        const tokenData: TokenResponse = response.data
        store.dispatch('updateAccessToken', tokenData.access_token)
        return true
      } catch (e: any) {
        if (e.response && (e.response.status === 400 || e.response.status === 401)) {
          // refresh token is invalid or expired
          vm.$cookies.remove('db_refresh')
          alert('Dropbox login expired. Please log in again.')
        }
      }
    }
    store.dispatch('updateAccessToken', '')
    return false
  },

  // load user info
  async loadUserInfo() {
    const url = `https://api.dropboxapi.com/2/users/get_current_account`

    try {
      const response = await axios.post(url, null, {
        headers: {
          'Authorization': getBearerToken(),
          'Content-Type': 'application/json',
        },
      })

      store.dispatch('updateUserInfo', response.data)
    } catch (e: any) {
      if (e.response && e.response.status === 401) {
        if (await this.tryRefreshAccessToken()) {
          this.loadUserInfo()
        }
      }
    }
  },
}
