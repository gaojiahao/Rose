<template>
  <div class="pages">
    <component
      :is='currentComponent'>
    </component>
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
  watch: {
    $route: {
      handler(to, from ){
        let {name} = to;
        if(name === 'HOME') {
          from.meta.keepAlive = false;
        }
      }
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
  }
}
</script>

<style lang='scss'>

</style>
