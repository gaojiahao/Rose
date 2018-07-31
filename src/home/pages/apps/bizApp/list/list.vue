<template>
  <div class="inPage">
    <component
      :is='currentComponent'
      ref='list'>
    </component>
    <router-view></router-view>
    <loading-form :show='showLoadding'></loading-form>
  </div>

</template>

<script>
import Loadding from 'components/Loading'
export default {
  data(){
    return {
      currentComponent : '',
      showLoadding : true,
      code :''
    }
  },
  components:{
    'loading-form' : Loadding
  },
  created(){
    let code = this.$route.params.code;
    if(code){
      this.currentComponent = require(`components/list/${code}Form.vue`).default;
    }
    setTimeout(()=>{
      this.showLoadding = false
    },1000)
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
}
</script>

<style lang='scss'>
@import '~components/scss/bizList.scss';
</style>
