import Vue from "vue"
import axios from "axios"
import tools from "@/utils/tools"

const vm = Vue.prototype
const db_app_client_id = '28mt3r9bdugbsoh'
const redirect_uri = window.location.origin

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
  async handleDropboxOAuthRedirect(authorizationCode: string, codeVerifier: string): Promise<string> {
    const tokenRequestURL = `https://api.dropbox.com/oauth2/token` +
                            `?client_id=${db_app_client_id}` +
                            `&redirect_uri=${encodeURIComponent(redirect_uri)}` +
                            `&code_verifier=${codeVerifier}` +
                            `&code=${authorizationCode}` +
                            `&grant_type=authorization_code`
    
    const response = await axios.post(tokenRequestURL)

    return response.data.access_token
  }
}