<template>
  <div class="inPage">
    <component
      :is='currentComponent'
      ref='list'>
    </component>
    <router-view></router-view>
  </div>

</template>

<script>
import businessMap from '../../../maps/businessText.js'
export default {
  data(){
    return {
      currentComponent : '',
      code :''
    }
  },
  created(){
    this.$loading.show();
    let code = this.$route.params.code;
    if(code){
      this.currentComponent = require(`components/list/${code}_List.vue`).default;
    }
  },
  watch: {
    $route: {
      handler(to, from) {
        // 判断是否重新请求页面
        if (to.meta.reload && to.path.indexOf('/list') !== -1) {
          to.meta.reload = false;
          this.$refs.list.reloadData()
        }
      },
    }
  },
  beforeRouteEnter (to, from, next) {
    let code  = businessMap[to.params.code];
    to.meta.title = code.slice(-4) + '列表';
    next();
  }
}
</script>

<style lang='scss'></style>
