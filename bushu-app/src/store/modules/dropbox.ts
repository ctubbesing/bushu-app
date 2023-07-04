import { DBAccountInfo } from "@/types/dropboxTypes";

export default {
  state: {
    db_accessToken: '' as string,
    db_userInfo: null as null | DBAccountInfo
  },
  getters: {
    db_isLoggedIn(state: any): boolean {
      return state.db_userInfo !== null
    }
  },
  mutations: {
    setAccessToken(state: any, accessToken: string) {
      state.db_accessToken = accessToken
    },
    setUserInfo(state: any, userInfo: null | DBAccountInfo) {
      state.db_userInfo = userInfo
    },
  },
  actions: {
    updateAccessToken(context: any, accessToken: string) {
      context.commit('setAccessToken', accessToken)
    },
    updateUserInfo(context: any, userInfo: null | DBAccountInfo) {
      context.commit('setUserInfo', userInfo)
    },
  },
}
