import { defineStore } from 'pinia'

export interface State {
  isLoading: boolean
  userWidgets: string[]
  accessTokens: { [name: string]: string }
}

export const useHomeStore = defineStore('home', {
  state: (): State => ({
    isLoading: false,
    userWidgets: [],
    accessTokens: {}
  }),
  actions: {
    updateIsLoading(isLoading: boolean) {
      this.isLoading = isLoading
    },
    updateUserWidgets(userWidgets: string[]) {
      this.userWidgets = userWidgets
    },
    updateSingleAccessToken(token: { key: string; value: string }) {
      this.accessTokens[token.key] = token.value
    },
    updateAccessTokens(accessTokens: { [name: string]: string }) {
      this.accessTokens = accessTokens
    }
  }
})
