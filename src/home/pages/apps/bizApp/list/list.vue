<template>
  <div class="pages">
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
    let query = this.$route.query;
    if(query.code){
      this.code = query.code;
      this.currentComponent = require(`components/list/${this.code}Form.vue`).default;
    }
    setTimeout(()=>{
      this.showLoadding = false
    },1000)
  },
  watch: {
    $route: {
      handler(to, from) {
        // 判断是否重新请求页面
        if (to.meta.reload && to.path === '/list') {
          to.meta.reload = false;
          this.$refs.list.reloadData()
        }
      },
    }
  },
}
</script>

<style lang='scss'>

</style>
