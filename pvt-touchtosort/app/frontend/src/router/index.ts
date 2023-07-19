import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import SetDirection from '../views/set-direction.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Sorting',
    component: SetDirection
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
