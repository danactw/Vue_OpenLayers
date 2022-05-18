import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import ClusterMap from '../views/ClusterMap.vue'
import VectorMap from '../views/VectorMap.vue'
import FeatureMap from '../views/FeatureMap.vue'
import MeasureMap from '../views/MeasureMap.vue'
import NewMeasureMap from '../views/NewMeasureMap.vue'
import BaseMap from '../views/BaseMap.vue'
import TestMap from '../views/TestMap.vue'

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
    path: '/vectormap',
    name: 'VectorMap',
    component: VectorMap
  },
  {
    path: '/featuremap',
    name: 'FeatureMap',
    component: FeatureMap
  },
  {
    path: '/measuremap',
    name: 'MeasureMap',
    component: MeasureMap
  },
  {
    path: '/newmeasuremap',
    name: 'NewMeasureMap',
    component: NewMeasureMap
  },
  {
    path: '/basemap',
    name: 'BaseMap',
    component: BaseMap
  },
  {
    path: '/testmap',
    name: 'TestMap',
    component: TestMap
  },
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
