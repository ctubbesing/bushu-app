import Vue from "vue";
import Vuex from "vuex";
import dropbox from "./modules/dropbox";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    userWidgets: [] as string[],
  },
  mutations: {
    setUserWidgets(state: any, widgets: string[]) {
      state.userWidgets = widgets
    },
  },
  actions: {
    updateUserWidgets(context: any, widgets: string[]) {
      context.commit('setUserWidgets', widgets)
    },
  },
  modules: {
    dropbox,
  },
});
