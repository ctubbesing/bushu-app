import { createRouter, createWebHashHistory } from 'vue-router'
import Home from '@/views/HomeView.vue'
// import Watchlist from "@/views/Watchlist.vue"
import Gallery from "@/views/GalleryView.vue"
// import About from "@/views/About.vue"

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    // {
    //   path: "/about",
    //   name: "About",
    //   component: About,
    // },
    // {
    //   path: "/watchlist",
    //   name: "Watchlist",
    //   component: Watchlist,
    // },
    {
      path: "/gallery",
      name: "gallery",
      component: Gallery,
    },
  ]
})

export default router
