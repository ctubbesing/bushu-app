import { createRouter, createWebHashHistory } from 'vue-router'
import Home from '@/views/HomeView.vue'
import DropletWrapper from './components/gallery/DropletWrapper.vue'
import GalleryView from './views/GalleryView.vue'
import ImageAnalyzer from './components/gallery/ImageAnalyzer/ImageAnalyzer.vue'
import SandboxGame from './components/gallery/SandboxGame.vue'
import CanvasTest from './components/gallery/CanvasTest.vue'
import AlethiWrapper from './components/gallery/AlethiWrapper.vue'
import RomajiConverter from './components/gallery/RomajiConverter.vue'
import WatchlistView from './views/WatchlistView.vue'
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
    {
      path: "/watchlist",
      name: "watchlist",
      component: WatchlistView,
    },
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
          name: 'Image Analyzer',
          component: ImageAnalyzer,
        },
        {
          path: 'rayTracer',
          name: 'Ray Tracer',
          component: CanvasTest,
        },
        {
          path: 'alethiScript',
          name: 'Alethi Script',
          component: AlethiWrapper,
        },
        {
          path: 'romaji',
          name: 'Romaji Converter',
          component: RomajiConverter,
        },
      ],
    },
  ]
})

export default router
