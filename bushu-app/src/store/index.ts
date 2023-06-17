import Vue from "vue";
import Vuex from "vuex";
import dropbox from "./modules/dropbox";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    isLoading: false as boolean,
    userWidgets: [] as string[],
  },
  mutations: {
    setIsLoading(state: any, isLoading: boolean) {
      state.isLoading = isLoading
    },
    setUserWidgets(state: any, userWidgets: string[]) {
      state.userWidgets = userWidgets
    },
  },
  actions: {
    updateIsLoading(context: any, isLoading: boolean) {
      context.commit('setIsLoading', isLoading)
    },
    updateUserWidgets(context: any, userWidgets: string[]) {
      context.commit('setUserWidgets', userWidgets)
    },
  },
  modules: {
    dropbox,
  },
});
