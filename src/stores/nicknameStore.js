import { defineStore } from "pinia"

export const useNicknameStore = defineStore("nicknames", {
  state: () => ({
    nicknames: {} // key = pokemon name, value = nickname
  }),
  actions: {
    setNickname(name, nickname) {
      this.nicknames[name] = nickname
    }
  },
  persist: true // ✅ only this store persists
})
