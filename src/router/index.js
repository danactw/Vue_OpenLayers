import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import ClusterMap from '../views/ClusterMap.vue'
import BaseMap from '../views/BaseMap.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/clustermap',
    name: 'ClusterMap',
    component: ClusterMap
  },
  {
    path: '/basemap',
    name: 'BaseMap',
    component: BaseMap
  },
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
