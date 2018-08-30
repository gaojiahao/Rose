<template>
  <div class="inPage">
    <component
      :is='currentComponent'
      :refresh-request='isrefresh'
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
      code :'',
      isrefresh : false,
    }
  },
  created(){
    // this.$loading.show();
    let code = this.$route.params.code;
    if(code){
      this.code = code;
      this.currentComponent = require(`components/list/${code}_List.vue`).default;
    }
  },
  watch: {
    $route: {
      handler(to, from) {
        // 判断是否重新请求页面
        if (to.meta.reload && to.path.indexOf('/list') !== -1) {
          // to.meta.reload = false;
          // this.$refs.list.reloadData()
        }
      },
    }
  },
  beforeRouteEnter (to, from, next) {
    let code  = businessMap[to.params.code];
    to.meta.title = code.slice(-4) + '列表';
    next();
  },
  activated() {
    this.$loading.show();
    let reload = this.$route.meta.reload;
    if (reload) {
      let code = this.$route.params.code;
      if (code) {
        // 在提交页面提交成功时进入该判断
        if (this.code === code && this.currentComponent) {
          this.$refs.list.reloadData();
        }
        this.code = code;
        this.currentComponent = require(`components/list/${code}_List.vue`).default;
      }
      this.$route.meta.reload = false;
    }
  },
  beforeRouteLeave (to, from, next) {
    let { path } = to;
    if(path === '/home'){
      this.$loading.hide();
      this.currentComponent = null;
      from.meta.reload = true;
    }
    next();
  }
}
</script>

<style lang='scss'></style>
