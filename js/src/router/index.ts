import Vue from "vue";
import VueRouter, {createRouter, createWebHistory} from "vue-router";
import Home from "../components/Home.vue";
import TestRunner from "../components/tests/TestRunner.vue";
import Wat from "@/components/Wat.vue";
import WrapTest from "@/components/WrapTest.vue";
import EvalRenderTest from "@/components/EvalRenderTest.vue";
import WasmTest from "@/components/WasmTest.vue";
import WasmTest2 from "@/components/WasmTest2.vue";

const routes = [
  {
    path: "/",
    name: "Home",
    component: WasmTest
    // component: Home
  },
  // {
  //   path: "/old",
  //   name: "OldHome",
  //   component: Home
  // },
  // {
  //   path: "/tests",
  //   name: "TestRunner",
  //   component: TestRunner
  // },
  // {
  //   path: "/wat",
  //   component: Wat
  // },
  // {
  //   path: "/wrap",
  //   component: WrapTest
  // },
  // {
  //   path: "/eval",
  //   component: EvalRenderTest
  // },
  // {
  //   path: "/wasm2",
  //   component: WasmTest
  // }
  // {
  //   path: '/about',
  //   name: 'About',
  //   // route level code-splitting
  //   // this generates a separate chunk (about.[hash].js) for this route
  //   // which is lazy-loaded when the route is visited.
  //   component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
  // }
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
});

export default router;
