import Vue from "vue"
import VueRouter from "vue-router"
import Home from "../views/Home.vue"
import RayTracer from "../views/RayTracer.vue"
import About from "../views/About.vue"

Vue.use(VueRouter);

export default new VueRouter({
  routes: [
    {
      path: "/",
      name: "Home",
      component: Home,
    },
    {
      path: "/raytracer",
      name: "RayTracer",
      component: RayTracer,
    },
    {
      path: "/about",
      name: "About",
      component: About,
    },
  ]
});
