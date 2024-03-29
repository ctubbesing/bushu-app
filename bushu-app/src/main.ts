import Vue from "vue"
import App from "./App.vue"
import router from "./router"
import store from "./store"
import { BootstrapVue, BootstrapVueIcons } from "bootstrap-vue"
import VueCookies from 'vue-cookies'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import mixin from "./mixin"

Vue.config.productionTip = false;
Vue.use(BootstrapVue)
Vue.use(BootstrapVueIcons)
Vue.use(VueCookies)
Vue.mixin(mixin)

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount("#app");
