import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const store = () => new Vuex.Store({

  state: {
    userData: {},
    notiNotify: [],
  },
  getters: {
    userData (state) {
      return state.userData
    },
  },
  mutations: {
    setUserInfo (state, data) {
        state.userData = data
    },
    setNotify (state, data) {
        state.notiNotify = data
    },
  },
})

export default store