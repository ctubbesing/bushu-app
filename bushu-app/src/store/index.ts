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
    updateAccessToken(context, accessToken) {
      context.commit('setAccessToken', accessToken)
    },
    async loadUserInfo(context) {
      const url = `https://api.dropboxapi.com/2/users/get_current_account`

      try {
        const response = await axios.post(url, null, {
          headers: {
            'Authorization': `Bearer ${context.state.db_accessToken}`,
            'Content-Type': 'application/json',
          },
        })

        context.commit('setUserInfo', response.data)
      } catch (e) {
        console.log('!!! Error getting user info')
        console.log(e)
      }
    },
  },
  modules: {},
});
