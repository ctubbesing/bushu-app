import Vue from "vue"
import axios from "axios"
import tools from "@/utils/tools"

const vm = Vue.prototype
const db_app_client_id = '28mt3r9bdugbsoh'
// const redirect_uri = '/#/dropboxLogin' /////// not correct

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

    console.log('test cookie: ')
    console.log(vm.$cookies.get('testCookie'))
    vm.$cookies.set('testCookie', 'asdf' + new Date())
    console.log('test cookie again3: ')
    console.log(vm.$cookies.get('testCookie'))

    const authorizationURL = `https://www.dropbox.com/oauth2/authorize` +
                              `?client_id=${db_app_client_id}` +
                              // (redirect_uri ? (`&redirect_uri=${redirect_uri}`) : '') +
                              `&code_challenge_method=S256` +
                              `&code_challenge=${codeChallenge}` +
                              (doRememberMe ? `token_access_type=offline` : '') +
                              `&response_type=code`

    console.log('authorizationURL: ' + authorizationURL)
    window.open(authorizationURL, undefined, 'height=700, width=1100')
  },
  // step 2 of PKCE authorization code flow
  // async handleDropboxAuthorizationRedirect() {}
}