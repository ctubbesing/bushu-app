import Vue from "vue"
import VueRouter from "vue-router"
import Home from "../views/Home.vue"
import RayTracer from "../views/RayTracer.vue"
import About from "../views/About.vue"

Vue.use(VueRouter);

export default new VueRouter({
  mode: 'history',
  base: '/bushu-app',
  routes: [
    // {
    //   path: "/",
    //   redirect: { name: 'Home' },
    // },
    {
      path: "/",
      name: "Home",
      component: Home,
    },
    {
      path: "/about",
      name: "About",
      component: () => import(/* webpackChunkName: "about" */ "../views/About.vue"),
      // component: About,
    },
    {
      path: "/raytracer",
      name: "RayTracer",
      component: () => import(/* webpackChunkName: "about" */ "../views/RayTracer.vue"),
      // component: RayTracer,
    },
  ]
});
