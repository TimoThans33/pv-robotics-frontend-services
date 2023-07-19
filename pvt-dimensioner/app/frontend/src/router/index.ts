import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import Sorting from '../views/sorting.vue'
import Operator from '../views/operator.vue'
import Dimensioner from '../views/dimensioner.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Dimensioner',
    component: Dimensioner
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
