<template>
  <div class="container mt-4">
    <h2 class="mb-3 text-light">Pokémon List</h2>

    <!-- Search + Type Filter -->
    <div class="mb-3 row">
      <div class="col-md-6 mb-2">
        <input
          v-model="searchQuery"
          type="text"
          class="form-control bg-dark text-light border-light"
          placeholder="Search Pokémon by name or nickname..."
        />
      </div>

      <div class="col-md-6 mb-2">
        <select v-model="selectedType" class="form-select bg-dark text-light border-light">
          <option value="">All Types</option>
          <option v-for="t in allTypes" :key="t" :value="t">{{ t }}</option>
        </select>
      </div>
    </div>

    <!-- Loader -->
    <div v-if="loading" class="text-center text-light">
      <div class="spinner-border text-light" role="status"></div>
    </div>

    <!-- Pokémon Grid -->
    <div v-else class="row row-cols-1 row-cols-md-4 g-4">
      <div v-for="pokemon in filteredPokemons" :key="pokemon.id" class="col">
        <div
          class="card pokemon-card shadow-sm h-100 text-center text-light border-0"
          @click="goToDetails(pokemon.name)"
          style="cursor: pointer;"
        >
          <img :src="pokemon.image" class="card-img-top p-3" alt="pokemon" />
          <div class="card-body">
              <h5 class="card-title">
                <span class="text-capitalize">{{ pokemon.nickname || pokemon.name }}</span>
                <span v-if="pokemon.nickname" class="small" style="color: #bbb;">
                  ({{ pokemon.name }})
                </span>
              </h5>
            <p class="card-text small text-white">
              #{{ pokemon.id }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue"
import { useRouter } from "vue-router"
import { usePokemonStore } from "../stores/pokemonStore"

const router = useRouter()
const store = usePokemonStore()

const loading = ref(true)
const searchQuery = ref("")
const selectedType = ref("")

const allTypes = computed(() => {
  const types = new Set()
  store.pokemons.forEach((p) => {
    p.types.forEach((t) => types.add(t.type.name))
  })
  return Array.from(types).sort()
})

const filteredPokemons = computed(() =>
  store.pokemons.filter((p) => {
    const search = searchQuery.value.toLowerCase()
    const matchesName =
      p.name.toLowerCase().includes(search) ||
      (p.nickname && p.nickname.toLowerCase().includes(search))
    const matchesType =
      !selectedType.value || p.types.some((t) => t.type.name === selectedType.value)
    return matchesName && matchesType
  })
)

onMounted(async () => {
  if (store.pokemons.length === 0) {
    try {
      const response = await fetch("https://pokeapi.co/api/v2/pokemon?limit=100")
      const data = await response.json()

      const promises = data.results.map(async (p) => {
        const res = await fetch(p.url)
        const details = await res.json()
        return {
          id: details.id, // ✅ ID added here
          name: p.name,
          image: details.sprites.other["official-artwork"].front_default,
          types: details.types,
          height: details.height,
          weight: details.weight,
          abilities: details.abilities,
          stats: details.stats,
          nickname: ""
        }
      })

      const results = await Promise.all(promises)
      store.setPokemons(results)
    } catch (error) {
      console.error("Error fetching Pokémon:", error)
    } finally {
      loading.value = false
    }
  } else {
    loading.value = false
  }
})

function goToDetails(name) {
  router.push(`/pokemon/${name}`)
}
</script>

<style scoped>
.pokemon-card {
  background-color: #1e1e1e;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.pokemon-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.6);
}
</style>
