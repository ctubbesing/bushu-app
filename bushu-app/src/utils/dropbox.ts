import Vue from "vue"
import axios from "axios"
import tools from "@/utils/tools"

const vm = Vue.prototype
const db_app_client_id = '28mt3r9bdugbsoh'
const redirect_uri = 'http://localhost:8080/' // kinda works but maybe still not all correct bc issues getting query params later

export default {
  // step 1 of PKCE authorization code flow
  async authorizeWithDropbox(doRememberMe: boolean) {
    console.log('authorizing...')
    const codeVerifier = tools.generateCodeVerifier()
    const codeChallenge = await tools.sha256(codeVerifier)
    vm.$cookies.set('code_verifier', codeVerifier)

    console.log(doRememberMe ? 'Remembering' : 'Not remembering')
    console.log('codeVerifier:  ' + codeVerifier)
    console.log('codeChallenge: ' + codeChallenge)

    const authorizationURL = `https://www.dropbox.com/oauth2/authorize` +
                              `?client_id=${db_app_client_id}` +
                              `&redirect_uri=${encodeURIComponent(redirect_uri)}` +
                              `&code_challenge_method=S256` +
                              `&code_challenge=${codeChallenge}` +
                              (doRememberMe ? `&token_access_type=offline` : '') +
                              `&response_type=code`

    console.log('authorizationURL: ' + authorizationURL)
    // window.location.replace(authorizationURL)
    window.open(authorizationURL, undefined, 'height=700, width=1100') // eventually use location.replace
  },
  // step 2 of PKCE authorization code flow
  async handleDropboxOAuthRedirect(authorizationCode: string, codeVerifier: string) {
    console.log('Starting OAuth token request')
    const tokenRequestURL = `https://api.dropbox.com/oauth2/token` +
                            `?client_id=${db_app_client_id}` +
                            `&redirect_uri=${encodeURIComponent(redirect_uri)}` +
                            `&code_verifier=${codeVerifier}` +
                            `&code=${authorizationCode}` +
                            `&grant_type=authorization_code`
    
    console.log('tokenRequestURL: ' + tokenRequestURL)
    const response = await axios.post(tokenRequestURL)
    console.log('response from login redirect:')
    console.log(response)
  }
}