import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    user: null,
    inventory: [],
  },
  mutations: {
    setUser(state, user) {
      state.user = user;
    },
    updateInventory(state, items) {
      state.inventory = items;
    },
  },
});
