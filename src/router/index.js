import { createRouter, createWebHistory } from 'vue-router'
import PokemonList from '../components/PokemonList.vue'
import PokemonDetail from '../components/PokemonDetail.vue'

const routes = [
  { path: '/', name: 'Home', component: PokemonList },
  { path: '/pokemon/:name', name: 'PokemonDetail', component: PokemonDetail, props: true }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
