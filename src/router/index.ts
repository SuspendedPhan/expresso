import Vue from "vue";
import VueRouter from "vue-router";
import Home from "../components/Home.vue";
import TestRunner from "../components/tests/TestRunner.vue";
import Wat from "@/components/Wat.vue";
import WrapTest from "@/components/WrapTest.vue";
import D3TestPage from "@/components/D3TestPage.vue";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home,
  },
  {
    path: "/tests",
    name: "TestRunner",
    component: TestRunner,
  },
  {
    path: "/wat",
    component: Wat,
  },
  {
    path: "/wrap",
    component: WrapTest,
  },
  {
    path: "/d3",
    component: D3TestPage,
  },
  // {
  //   path: '/about',
  //   name: 'About',
  //   // route level code-splitting
  //   // this generates a separate chunk (about.[hash].js) for this route
  //   // which is lazy-loaded when the route is visited.
  //   component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
  // }
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes,
});

export default router;
