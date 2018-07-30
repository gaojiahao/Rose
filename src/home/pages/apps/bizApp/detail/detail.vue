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
import detailMap from './../../../maps/detail'

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
      let [prefix] = this.transCode.split('_');
      let code = detailMap[prefix] || prefix;
      try {
        this.currentComponent = require(`components/detail/${code}Form.vue`).default;
      } catch (e) {
        this.$vux.alert.show({
          content: '抱歉，无法支持您查看的交易号，请确认交易号是否正确',
          onHide: ()=>{
            this.$router.go(-1);
          }
        });
      }
    }
    setTimeout(()=>{
      this.showLoadding = false
    },1000)
  },
  beforeRouteLeave (to, from, next) {
     let {path} = to;
    // 新建物料，修改列表页的meta值
    if (this.submitSuccess && path.indexOf('/list') !== -1) {
      to.meta.reload = true;
    }
    next();
  }

}
</script>

<style lang='scss'></style>
