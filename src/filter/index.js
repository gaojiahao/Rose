import Vue from 'vue'
import filedTypeFilter from './filedTypeFilter'
import timeChangeFilter from './timeChangeFilter'
import appIconFilter from './appIconFilter'

Vue.filter('filedTypeFilter', filedTypeFilter)
Vue.filter('timeChangeFilter', timeChangeFilter)
Vue.filter('appIconFilter', appIconFilter)