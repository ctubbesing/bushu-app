import Vue from "vue"
import VueRouter from "vue-router"
import Home from "@/views/Home.vue"
import Watchlist from "@/views/Watchlist.vue"
import RayTracer from "@/views/RayTracer.vue"
// import About from "@/views/About.vue"

Vue.use(VueRouter);

export default new VueRouter({
  mode: 'hash',
  base: process.env.BASE_URL,
  routes: [
    {
      path: "/",
      name: "Home",
      component: Home,
    },
    // {
    //   path: "/about",
    //   name: "About",
    //   component: About,
    // },
    {
      path: "/watchlist",
      name: "Watchlist",
      component: Watchlist,
    },
    {
      path: "/raytracer",
      name: "RayTracer",
      component: RayTracer,
    },
  ]
});
