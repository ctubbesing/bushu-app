import axios from "axios";
import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    db_accessToken: '' as string,
    db_userInfo: null as any
  },
  mutations: {
    setAccessToken(state, accessToken: string) {
      state.db_accessToken = accessToken
    },
    setUserInfo(state, userInfo: any) {
      state.db_userInfo = userInfo
    },
  },
  actions: {
    updateAccessToken(context, accessToken: string) {
      context.commit('setAccessToken', accessToken)
    },
    updateUserInfo(context, userInfo) {
      context.commit('setUserInfo', userInfo)
    },
  },
  modules: {},
});
