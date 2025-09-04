import { defineStore } from "pinia"

export const usePokemonStore = defineStore("pokemon", {
  state: () => ({
    pokemons: []
  }),
  actions: {
    setPokemons(list) {
      this.pokemons = list
      this.loadNicknames()   // ✅ Reapply nicknames after setting list
    },
    updatePokemon(name, changes) {
      const p = this.pokemons.find((x) => x.name === name)
      if (p) {
        Object.assign(p, changes)
        this.saveNicknames()
      }
    },
    clearNickname(name) {
      const p = this.pokemons.find((x) => x.name === name)
      if (p) {
        p.nickname = ""
        this.saveNicknames()
      }
    },
    saveNicknames() {
      const nickMap = {}
      this.pokemons.forEach((p) => {
        if (p.nickname) {
          nickMap[p.name] = p.nickname
        }
      })
      localStorage.setItem("nicknames", JSON.stringify(nickMap))
    },
    loadNicknames() {
      const raw = localStorage.getItem("nicknames")
      if (!raw) return
      const nickMap = JSON.parse(raw)
      this.pokemons.forEach((p) => {
        if (nickMap[p.name]) {
          p.nickname = nickMap[p.name]
        }
      })
    }
  }
})
