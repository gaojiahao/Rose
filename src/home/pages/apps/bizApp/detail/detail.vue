<template>
  <div class="pages">
    <div class="pages" ref='detail'>
      <component
        :is='currentComponent'
        v-model='showLoadding'
        @change='modifyRoute'>
      </component>
    </div>   
    <!-- 页面进入加载动画-->
    <loadding-form :show='showLoadding'></loadding-form>
  </div>

</template>

<script>
import LoaddingForm from 'components/Loading'
import detailMap from './../../../maps/detail'
import Bscroll from 'better-scroll'
export default {
  data(){
    return {
      currentComponent : '',
      showLoadding : true,
      transCode :'',
      submitSuccess : false,
      detailScroll : null,
    }
  },
  components:{
    LoaddingForm
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
          content: '抱歉，无法支持该应用的查看',
          onHide: ()=>{
            this.$router.go(-1);
          }
        });
      }
    }
    // setTimeout(()=>{
    //   this.showLoadding = false
    // },1000)
  },
  mounted(){
    this.$nextTick(()=>{
      this.detailScroll = new Bscroll(this.$refs.detail,{
        click : true,
      })
    })

  },
  beforeRouteLeave (to, from, next) {
     let {path} = to;
    // 新建物料，修改列表页的meta值
    if (this.submitSuccess && (path.indexOf('/list') !== -1 ||path.indexOf('msglist') !== -1)) {
      to.meta.reload = true;
    }
    next();
  }

}
</script>

<style lang='scss' scoped>
.apply_detail{
  width:100%;
  height:100%;
  overflow: hidden;
}

</style>
