import type { DBAccountInfo } from '@/types/dropboxTypes'
import { defineStore } from 'pinia'

export interface State {
  accessToken: string
  userInfo: null | DBAccountInfo
}

export const useDropboxStore = defineStore('dropbox', {
  state: (): State => ({
    accessToken: '',
    userInfo: null
  }),
  getters: {
    isLoggedIn: (state: State): boolean => state.userInfo !== null,
    isReady: (state: State): boolean => state.accessToken !== ''
  },
  actions: {
    updateAccessToken(accessToken: string): void {
      this.accessToken = accessToken
    },
    updateUserInfo(userInfo: null | DBAccountInfo): void {
      this.userInfo = userInfo
    }
  }
})
