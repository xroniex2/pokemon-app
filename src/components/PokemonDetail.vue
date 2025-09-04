<template>
  <div class="container mt-5 text-light" v-if="pokemon">
    <div class="row justify-content-center">
      <!-- Left Column: Image + Flavor -->
      <div class="col-md-4 text-center">
        <img
          :src="pokemon.image"
          alt="pokemon"
          class="img-fluid mb-4 shadow-lg rounded"
          style="max-width: 300px; background-color: #111;"
        />

        <!-- Pokedex ID + Generation -->
        <div class="p-3 rounded mb-3 text-start" style="background-color: #1e1e1e;">
          <p class="mb-1"><span class="fw-bold">Pokédex ID:</span> #{{ pokemon.id }}</p>
          <p class="mb-0"><span class="fw-bold">Generation:</span> {{ generation }}</p>
        </div>

        <!-- Flavor Text -->
        <div class="p-3 rounded fst-italic small text-start" style="background-color: #1e1e1e;">
          {{ flavorText }}
        </div>
      </div>

      <!-- Right Column: Info -->
      <div class="col-md-6">
        <!-- Name -->
        <h2 class="display-5 fw-bold text-uppercase mb-4 border-bottom pb-2">
          {{ pokemon.nickname ? pokemon.nickname : pokemon.name }}
        </h2>

        <!-- Details -->
        <div class="mb-3 p-3 rounded" style="background-color: #1e1e1e;">
          <p><span class="fw-bold">Types:</span>
            <span
              v-for="(type, index) in pokemon.types"
              :key="index"
              class="badge bg-light text-dark me-1"
            >
              {{ type.type.name }}
            </span>
          </p>
          <p><span class="fw-bold">Height:</span> {{ pokemon.height }}</p>
          <p><span class="fw-bold">Weight:</span> {{ pokemon.weight }}</p>
          <p><span class="fw-bold">Abilities:</span>
            <span
              v-for="(ability, index) in pokemon.abilities"
              :key="index"
              class="badge bg-secondary me-1"
            >
              {{ ability.ability.name }}
            </span>
          </p>
        </div>

        <!-- Stats -->
        <h4 class="fw-bold mb-3 border-bottom pb-2">Base Stats</h4>
        <div v-for="stat in pokemon.stats" :key="stat.stat.name" class="mb-3">
          <div class="d-flex justify-content-between">
            <span class="text-capitalize">{{ stat.stat.name }}</span>
            <span>{{ stat.base_stat }}</span>
          </div>
          <div class="progress bg-dark" style="height: 6px;">
            <div
              class="progress-bar bg-light"
              role="progressbar"
              :style="{ width: stat.base_stat + '%' }"
              :aria-valuenow="stat.base_stat"
              aria-valuemin="0"
              aria-valuemax="200"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Evolution Chain Centered -->
    <div class="row mt-5">
      <div class="col text-center">
        <h4 class="fw-bold mb-3 border-bottom pb-2">Evolution Chain</h4>
        <div class="d-flex justify-content-center align-items-center flex-wrap">
          <div
            v-for="(evo, index) in evolutionChain"
            :key="index"
            class="text-center mx-3"
          >
            <img :src="evo.image" alt="" style="width: 80px;" class="mb-1" />
            <p class="small text-capitalize mb-0">{{ evo.name }}</p>
            <span v-if="index < evolutionChain.length - 1" class="mx-2">→</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Actions Centered -->
    <div class="row mt-4">
      <div class="col d-flex justify-content-center align-items-center gap-3">
        <!-- Edit Nickname -->
        <div v-if="editing" class="d-inline-block">
          <input
            v-model="newNickname"
            class="form-control mb-2 bg-dark text-light border-light"
            placeholder="Enter a nickname"
          />
          <div class="d-flex justify-content-center gap-2">
            <button class="btn btn-light text-dark" @click="saveEdit">Save</button>
            <button class="btn btn-outline-light" @click="editing = false">Cancel</button>
          </div>
        </div>
        <button v-else class="btn btn-outline-light" @click="editing = true">
          Edit Nickname
        </button>

        <!-- Clear Nickname -->
        <button class="btn btn-outline-danger" @click="clearNick">
          Clear Nickname
        </button>

        <!-- Back Button -->
        <button class="btn btn-outline-light" @click="goBack">
          ← Back to List
        </button>
      </div>
    </div>
  </div>

  <!-- Loader -->
  <div v-else class="text-center mt-5 text-light">
    <div class="spinner-border text-light" role="status"></div>
    <p class="mt-2">Loading Pokémon details…</p>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue"
import { useRoute, useRouter } from "vue-router"
import { usePokemonStore } from "../stores/pokemonStore"

const route = useRoute()
const router = useRouter()
const store = usePokemonStore()

const editing = ref(false)
const newNickname = ref("")

const flavorText = ref("")
const generation = ref("")
const evolutionChain = ref([])

const pokemon = computed(() =>
  store.pokemons.find((p) => p.name === route.params.name) || null
)

onMounted(async () => {
  // Ensure store is populated
  if (store.pokemons.length === 0) {
    const response = await fetch("https://pokeapi.co/api/v2/pokemon?limit=100")
    const data = await response.json()
    const promises = data.results.map(async (p) => {
      const res = await fetch(p.url)
      const details = await res.json()
      return {
        id: details.id,
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
  }

  // Species info
  const speciesRes = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${route.params.name}`)
  const species = await speciesRes.json()

  const entry = species.flavor_text_entries.find((e) => e.language.name === "en")
  flavorText.value = entry ? entry.flavor_text.replace(/\f/g, " ") : "No description available."

  generation.value = species.generation.name.replace("generation-", "Gen ").toUpperCase()

  // Evolution chain
  const evoRes = await fetch(species.evolution_chain.url)
  const evoData = await evoRes.json()
  let evo = evoData.chain
  const chain = []
  while (evo) {
    const name = evo.species.name
    const pokeRes = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`)
    const pokeDetails = await pokeRes.json()
    chain.push({
      name,
      image: pokeDetails.sprites.other["official-artwork"].front_default
    })
    evo = evo.evolves_to[0]
  }
  evolutionChain.value = chain
})

function saveEdit() {
  if (newNickname.value.trim()) {
    store.updatePokemon(route.params.name, { nickname: newNickname.value })
    editing.value = false
  }
}

function clearNick() {
  store.clearNickname(route.params.name)
  editing.value = false
}

function goBack() {
  router.push("/")
}
</script>
