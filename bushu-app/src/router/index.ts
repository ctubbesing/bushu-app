import Vue from "vue"
import VueRouter from "vue-router"
import Home from "../views/Home.vue"
import RayTracer from "../views/RayTracer.vue"
import About from "../views/About.vue"

Vue.use(VueRouter);

export default new VueRouter({
  mode: 'history',
  routes: [
    {
      path: "/",
      redirect: { name: 'Home' },
    },
    {
      path: "/bushu-app/",
      name: "Home",
      component: Home,
    },
    {
      path: "/bushu-app/about",
      name: "About",
      component: About,
    },
    {
      path: "/bushu-app/raytracer",
      name: "RayTracer",
      component: RayTracer,
    },
  ]
});
