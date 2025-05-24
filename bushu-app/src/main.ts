import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import VueCookies from 'vue-cookies'

import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'

import loadBaseUtils from './plugins/BaseUtils'

import App from './App.vue'
import router from '@/router'
import vuetify from './plugins/vuetify'

const app = createApp(App)

const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(vuetify)
app.use(VueCookies)

loadBaseUtils(app)

app.mount('#app')
