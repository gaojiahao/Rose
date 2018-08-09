<template>
  <div class="pages">
    <component
      :is='currentComponent'
      v-model='showLoadding'
      @change='modifyRoute'>
    </component>
    <loading-form :show='showLoadding'></loading-form>
  </div>

</template>

<script>
import Loadding from 'components/Loading'
import detailMap from './../../../maps/detail'
import platfrom from '@/plugins/platform'
export default {
  data(){
    return {
      currentComponent : '',
      showLoadding : true,
      transCode :'',
      submitSuccess :false,
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
    let {code} = this.$route.params;
    this.currentComponent = require(`components/apply/${code}Form.vue`).default;
    // setTimeout(()=>{
    //   this.showLoadding = false
    // },1000)
  },
  mounted(){
    this.$nextTick(()=>{
      if(platfrom.isAndroid){
        window.addEventListener("resize", function() {
          if(document.activeElement.tagName=="INPUT" || document.activeElement.tagName=="TEXTAREA") {
            setTimeout(() => {
              document.activeElement.scrollIntoViewIfNeeded();
            }, 0);
          }
        })
      }
    })
  },
  beforeRouteLeave(to, from, next) {
    let {path} = to;
    // 新建物料，修改列表页的meta值
    if (this.submitSuccess && (path.indexOf('/list') !== -1 ||path.indexOf('/msglist') !== -1)) {
      to.meta.reload = true;
    }
    next();
  },
}
</script>

<style lang='scss'>
</style>
