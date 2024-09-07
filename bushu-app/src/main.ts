import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import VueCookies from 'vue-cookies'

import 'vuetify/styles'
// import 'roboto-fontface/css/roboto/roboto-fontface.css'
// import '@mdi/font/css/materialdesignicons.css'
import { createVuetify } from 'vuetify'

import App from './App.vue'
import router from './router'

const app = createApp(App)

const vuetify = createVuetify()
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(vuetify)
app.use(VueCookies)

app.mount('#app')
