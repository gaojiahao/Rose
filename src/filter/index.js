import Vue from 'vue'
import filedTypeFilter from './filedTypeFilter'
import timeChangeFilter from './timeChangeFilter'
import appIconFilter from './appIconFilter'
import dateFormatFilter from './dateFormatFilter'


Vue.filter('filedTypeFilter', filedTypeFilter)
Vue.filter('timeChangeFilter', timeChangeFilter)
Vue.filter('appIconFilter', appIconFilter)
Vue.filter('dateFormatFilter', dateFormatFilter)