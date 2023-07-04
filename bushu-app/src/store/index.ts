import Vue from "vue";
import Vuex from "vuex";
import dropbox from "./modules/dropbox";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    isLoading: false as boolean,
    userWidgets: [] as string[],
    accessTokens: {} as { [ name: string ]: string }
  },
  mutations: {
    setIsLoading(state: any, isLoading: boolean) {
      state.isLoading = isLoading
    },
    setUserWidgets(state: any, userWidgets: string[]) {
      state.userWidgets = userWidgets
    },
    setSingleAccessToken(state: any, token: { key: string, value: string }) {
      state.accessTokens[token.key] = token.value
    },
    setAccessTokens(state: any, accessTokens: { [ name: string ]: string }) {
      state.accessTokens = accessTokens
    },
  },
  actions: {
    updateIsLoading(context: any, isLoading: boolean) {
      context.commit('setIsLoading', isLoading)
    },
    updateUserWidgets(context: any, userWidgets: string[]) {
      context.commit('setUserWidgets', userWidgets)
    },
    updateSingleAccessToken(context: any, token: { key: string, value: string }) {
      context.commit('setSingleAccessToken', token)
    },
    updateAccessTokens(context: any, accessTokens: { [ name: string ]: string }) {
      context.commit('setAccessTokens', accessTokens)
    },
  },
  modules: {
    dropbox,
  },
});
