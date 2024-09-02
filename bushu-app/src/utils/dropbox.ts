import axios, { AxiosError } from 'axios'
import Cookies from 'js-cookie'
import { useHomeStore } from '@/stores/home'
import { useDropboxStore } from '@/stores/dropbox'
import tools from '@/utils/tools'
import type { TokenResponse, AppSettings } from '@/types/dropboxTypes'

const db_app_client_id = 'q9aarn0najvippt'
const redirect_uri = window.location.origin + import.meta.env.BASE_URL
const paths = {
  settingsPath: '/General/settings.json',
  tokensPath: '/General/Private/tokens.json'
}

function getBearerToken(): string {
  const dropboxStore = useDropboxStore()
  return `Bearer ${dropboxStore.accessToken === '' ? 'invalidToken' : dropboxStore.accessToken}`
}

export default {
  // step 1 of PKCE authorization code flow
  async authorizeWithDropbox(doRememberMe: boolean): Promise<void> {
    const codeVerifier = tools.generateCodeVerifier()
    const codeChallenge = await tools.sha256(codeVerifier)

    Cookies.set('code_verifier', codeVerifier, { expires: 5 / (24 * 60) })

    const authorizationURL =
      `https://www.dropbox.com/oauth2/authorize` +
      `?client_id=${db_app_client_id}` +
      `&redirect_uri=${encodeURIComponent(redirect_uri)}` +
      `&code_challenge_method=S256` +
      `&code_challenge=${codeChallenge}` +
      (doRememberMe ? `&token_access_type=offline` : '') +
      `&response_type=code`

    window.location.replace(authorizationURL)
  },

  // step 2 of PKCE authorization code flow
  async handleDropboxOAuthRedirect(authorizationCode: string, codeVerifier: string): Promise<void> {
    const tokenRequestURL =
      `https://api.dropbox.com/oauth2/token` +
      `?client_id=${db_app_client_id}` +
      `&redirect_uri=${encodeURIComponent(redirect_uri)}` +
      `&code_verifier=${codeVerifier}` +
      `&code=${authorizationCode}` +
      `&grant_type=authorization_code`

    const response = await axios.post(tokenRequestURL)
    const tokenData: TokenResponse = response.data

    if (tokenData.refresh_token) {
      Cookies.set('db_refresh', tokenData.refresh_token, { expires: 365 })
    } else {
      Cookies.remove('db_refresh')
    }

    const dropboxStore = useDropboxStore()
    dropboxStore.updateAccessToken(tokenData.access_token)
  },

  // delete tokens and user account data
  disconnectAccount(): void {
    const dropboxStore = useDropboxStore()
    dropboxStore.updateAccessToken('')
    dropboxStore.updateUserInfo(null)

    Cookies.remove('db_refresh')
  },

  // refresh access token with refresh token if available
  async tryRefreshAccessToken(): Promise<boolean> {
    const dropboxStore = useDropboxStore()
    const refreshToken: string | undefined = Cookies.get('db_refresh')
    if (refreshToken) {
      const tokenRequestURL =
        `https://api.dropbox.com/oauth2/token` +
        `?client_id=${db_app_client_id}` +
        `&refresh_token=${refreshToken}` +
        `&grant_type=refresh_token`
      try {
        const response = await axios.post(tokenRequestURL)
        const tokenData: TokenResponse = response.data

        dropboxStore.updateAccessToken(tokenData.access_token)
        return true
      } catch (error) {
        const e = error as AxiosError
        if (e.response && (e.response.status === 400 || e.response.status === 401)) {
          // refresh token is invalid or expired
          Cookies.remove('db_refresh')
          alert('Dropbox login expired. Please log in again.')
        }
      }
    }
    dropboxStore.updateAccessToken('')
    return false
  },

  // load file data
  async getData<T>(path: string, retries = 0): Promise<null | T> {
    const url = 'https://content.dropboxapi.com/2/files/download'
    const dropboxAPIArg = {
      path: path
    }

    try {
      const response = await axios.post(url, null, {
        headers: {
          Authorization: getBearerToken(),
          'Dropbox-API-Arg': JSON.stringify(dropboxAPIArg),
          'Content-Type': 'text/plain'
        }
      })
      return response.data
    } catch (error) {
      const e = error as AxiosError
      if (e.response && e.response.status === 401) {
        if (retries < 3 && (await this.tryRefreshAccessToken())) {
          return await this.getData(path, ++retries)
        }
      } else if (e.response && e.response.status === 409) {
        // path not found
        return null
      }
      throw error
    }
  },

  // save file data
  async saveData(path: string, data: unknown, retries = 0): Promise<void> {
    const url = 'https://content.dropboxapi.com/2/files/upload'
    const dropboxAPIArg = {
      path: path,
      autorename: true,
      mode: 'overwrite'
    }
    const dataBlob = new Blob([JSON.stringify(data, null, 2)])
    const dataBuffer = await dataBlob.arrayBuffer()

    try {
      await axios.post(url, dataBuffer, {
        headers: {
          Authorization: getBearerToken(),
          'Dropbox-API-Arg': JSON.stringify(dropboxAPIArg),
          'Content-Type': 'application/octet-stream'
        }
      })
    } catch (error) {
      const e = error as AxiosError
      console.log('save failed:')
      console.log(e)
      if (e.response && e.response.status === 401) {
        if (retries < 3 && (await this.tryRefreshAccessToken())) {
          await this.saveData(path, data, ++retries)
        }
      }
    }
  },

  // load user info
  async loadUserInfo(retries = 0): Promise<void> {
    const url = 'https://api.dropboxapi.com/2/users/get_current_account'

    try {
      const response = await axios.post(url, null, {
        headers: {
          Authorization: getBearerToken(),
          'Content-Type': 'application/json'
        }
      })

      const dropboxStore = useDropboxStore()
      dropboxStore.updateUserInfo(response.data)
    } catch (error) {
      const e = error as AxiosError
      if (e.response && e.response.status === 401) {
        if (retries < 3 && (await this.tryRefreshAccessToken())) {
          this.loadUserInfo(++retries)
        }
      }
    }
  },

  // get folder list
  async getFolders(path: string, retries = 0): Promise<null | unknown> {
    const url = 'https://api.dropboxapi.com/2/files/list_folder'
    const body = {
      path: path,
      recursive: true
    }

    try {
      const response = await axios.post(url, body, {
        headers: {
          Authorization: getBearerToken(),
          'Content-Type': 'application/json'
        }
      })
      return response.data
    } catch (error) {
      const e = error as AxiosError
      if (e.response && e.response.status === 401) {
        if (retries < 3 && (await this.tryRefreshAccessToken())) {
          return await this.getFolders(path, ++retries)
        }
      }
    }
  },

  // load API tokens
  async loadTokens(): Promise<void> {
    const tokens = await this.getData<{ [name: string]: string }>(paths.tokensPath)

    if (tokens) {
      const homeStore = useHomeStore()
      homeStore.updateAccessTokens(tokens)
    }
  },

  // save API tokens
  async saveTokens(): Promise<void> {
    const homeStore = useHomeStore()

    await this.saveData(paths.tokensPath, homeStore.accessTokens)
  },

  // load general settings
  async loadSettings(): Promise<void> {
    const settings: AppSettings | null = await this.getData<AppSettings>(paths.settingsPath)
    const widgetList = settings?.widgetList || []

    const homeStore = useHomeStore()
    homeStore.updateUserWidgets(widgetList)
  },

  // save all general settings
  async saveSettings(): Promise<void> {
    const homeStore = useHomeStore()
    const settings: AppSettings = {
      widgetList: homeStore.userWidgets
    }

    await this.saveData(paths.settingsPath, settings)
  },

  // reload all data
  async reloadAll(): Promise<void> {
    await this.loadUserInfo()
    await this.loadTokens()
    await this.loadSettings()
  }
}
