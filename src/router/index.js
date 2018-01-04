import Vue from 'vue'
import Router from 'vue-router'
import To_do from '../pages/to_do/td.vue'
import Finish from '../pages/finish/finish.vue'

Vue.use(Router)

export default new Router({
  routes: [
    { path:'/to_do',  component:To_do },
    { path:'/finish', component:Finish },
    { path:'/', redirect:'/to_do'}
  ]
})
