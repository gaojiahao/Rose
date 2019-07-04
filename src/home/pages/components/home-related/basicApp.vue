<template>
  <div class="app-part" v-if="BasicApps.length">
      <div class="app-container">
        <div class="app_classify_name">
          <p>基础对象</p>
        </div>
        <div class="app-list">
          <appMenu :app="app" cls="indval_app"
              v-for='(app, index) of BasicApps'
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
    BasicApps: {
      type : Array,
      require: true
    }
  }
}
</script>

<style lang='scss' scoped>
@import "~scss/home/homeCommon.scss";
</style>
