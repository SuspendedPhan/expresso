import Vue from 'vue'
import VueRouter from 'vue-router'
import Viewport from '../components/Viewport.vue'
import TestRunner from '../components/TestRunner.vue'

Vue.use(VueRouter)

  const routes = [
  {
    path: '/',
    name: 'Viewport',
    component: Viewport
  },
  // {
  //   path: '/tests',
  //   name: 'TestRunner',
  //   component: TestRunner
  // }
  // {
  //   path: '/about',
  //   name: 'About',
  //   // route level code-splitting
  //   // this generates a separate chunk (about.[hash].js) for this route
  //   // which is lazy-loaded when the route is visited.
  //   component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
  // }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
