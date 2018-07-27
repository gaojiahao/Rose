<template>
  <div class="pages">
    <component
      :is='currentComponent'
      @change='modifyRoute'>
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
      transCode :'',
      submitSuccess : false,
    }
  },
  components:{
    'loading-form' : Loadding
  },
  methods:{
    modifyRoute(val){
      this.submitSuccess = val;
    }
  },
  created(){
    let query = this.$route.query;
    if(query.transCode){
      this.transCode = query.transCode;
      if(this.transCode.indexOf('XSDD')>=0){
        this.currentComponent = require('components/detail/SOForm.vue').default;
      }
      else{
        this.currentComponent = require(`components/detail/${this.transCode.split('_')[0]}Form.vue`).default;
      }
      
    }
    setTimeout(()=>{
      this.showLoadding = false
    },1000)
  },
  beforeRouteLeave (to, from, next) {
     let {path} = to;
    // 新建物料，修改列表页的meta值
    if (this.submitSuccess && path === '/list') {
      to.meta.reload = true;
    }
    next();
  }
  
}
</script>

<style lang='scss'>

</style>
