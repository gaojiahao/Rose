<template>
  <div class="app-part" v-if="searchApps.length">
      <div class="app-container">
        <div class="app-list">
          <appMenu :app="app" cls="indval_app"
              v-for='(app, index) of searchApps'
              :key='index'/>
        </div>
      </div>
  </div>
</template>

<script>
import appMenu from './appMenu';

let swiper;
export default {
  components:{appMenu},
  props: {
    searchApps: {
      type : Array,
      require: true
    }
  }
}
</script>

<style lang='scss' scoped>
@import "~scss/home/homeCommon.scss";
</style>
