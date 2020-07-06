import '@babel/polyfill'
import 'mutationobserver-shim'
import Vue from 'vue'
import axios from 'axios'
import VueAxios from 'vue-axios'
// 相簿的套件
import Photoswipe from 'vue-pswipe'

import './plugins/bootstrap-vue'

import App from './App.vue'
import './registerServiceWorker'
import router from './router'
import store from './store'

// axios 預設傳送認證資訊
axios.defaults.withCredentials = true

Vue.use(VueAxios, axios)
Vue.use(Photoswipe)
Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
