import { createRouter, createWebHashHistory } from 'vue-router'
import Home from '@/views/HomeView.vue'
// import Watchlist from "@/views/Watchlist.vue"
import DropletWrapper from './components/gallery/DropletWrapper.vue'
import GalleryView from './views/GalleryView.vue'
import ImageAnalyzer from './components/gallery/ImageAnalyzer/ImageAnalyzer.vue'
import SandboxGame from './components/gallery/SandboxGame.vue'
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
      path: '/gallery',
      name: 'gallery',
      component: GalleryView,
      redirect: { name: 'DropletRing' },
      children: [
        {
          path: 'dropletRing',
          name: 'DropletRing',
          component: DropletWrapper,
          meta: {
            title: 'Droplet Ring',
          },
        },
        {
          path: 'sandbox',
          name: 'Sandbox',
          component: SandboxGame,
        },
        {
          path: 'imageAnalyzer',
          name: 'ImageAnalyzer',
          component: ImageAnalyzer,
          meta: {
            title: 'Image Analyzer',
          },
        },
      ],
    },
  ]
})

export default router
