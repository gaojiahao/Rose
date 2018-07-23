<template>
  <div class="pages">
    <component
      :is='currentComponent'>
    </component>
    <loading-form :show='showLoadding'></loading-form>
  </div>
  
</template>

<script>
import Loadding from '../components/Loading'
export default {
  data(){
    return {
      currentComponent : '',
      showLoadding : true,
      transCode :''
    }
  },
  components:{
    'loading-form' : Loadding
  },
  created(){
    let query = this.$route.query;
    if(query.transCode){
      this.transCode = query.transCode;
      this.currentComponent = require(`../components/detail/${this.transCode.split('_')[0]}Form.vue`).default;
    }
    setTimeout(()=>{
      this.showLoadding = false
    },1000)
  }
  
}
</script>

<style lang='scss'>

</style>
