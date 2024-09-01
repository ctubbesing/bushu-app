/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { DBAccountInfo } from "@/types/dropboxTypes";

export default {
  state: {
    db_accessToken: '' as string,
    db_userInfo: null as null | DBAccountInfo
  },
  getters: {
    db_isLoggedIn(state: any): boolean {
      return state.db_userInfo !== null
    },
    db_isReady(state: any): boolean {
      return state.db_accessToken !== ''
    },
  },
  mutations: {
    setAccessToken(state: any, accessToken: string): void {
      state.db_accessToken = accessToken
    },
    setUserInfo(state: any, userInfo: null | DBAccountInfo): void {
      state.db_userInfo = userInfo
    },
  },
  actions: {
    updateAccessToken(context: any, accessToken: string): void {
      context.commit('setAccessToken', accessToken)
    },
    updateUserInfo(context: any, userInfo: null | DBAccountInfo): void {
      context.commit('setUserInfo', userInfo)
    },
  },
}
