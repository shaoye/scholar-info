// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import axios from 'axios'
import VueAxios from 'vue-axios'
import VuePaginate from 'vue-paginate'
// import './assets/bootstrap-3.3.7-dist/css/bootstrap.min.css'
window.echarts = require('echarts')
Vue.config.productionTip = false
Vue.use(VueAxios, axios)
Vue.use(VuePaginate)
/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  template: '<App/>',
  components: { App }
})
