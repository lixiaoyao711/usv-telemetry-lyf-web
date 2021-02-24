import Vue from 'vue'
import Vuex from 'vuex'
import moduleTags from './module/tags'


Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    // 判断网络连接
    isNetworkConnected:false,
  },
  mutations: {
    updateIsNetworkConnected(state,data){
      state.isNetworkConnected = data
    }
  },
  actions: {

  },
  modules:{
    moduleTags,

  }
})
