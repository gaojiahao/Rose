<template>
  <div class="pages">
    <component
      :is='currentComponent'
      @sel-data='selData'
      @close='closeLoad'
      @change='modifyRoute'>
    </component>
    <submit-load :submit='submitLoadding'></submit-load>
  </div>

</template>

<script>
import Loadding from 'components/Loading'
import SubmitLoad from 'components/submitLoading'
import businessText from './../../../maps/businessText'
import platfrom from '@/plugins/platform'
export default {
  data(){
    return {
      currentComponent : '',
      showLoadding : true,
      transCode :'',
      submitSuccess :false,
      submitLoadding : false,
      transCode : null, //应用编码
      saveData:{} //缓存的数据
    }
  },
  components:{
    'loading-form' : Loadding,
    SubmitLoad
  },
  methods:{
    //关闭等待动画
    closeLoad(val){
      this.submitLoadding = val;
    },
    modifyRoute(val){
      this.submitSuccess = val;
    },
    //保存草稿
    selData(val){
      this.saveData = val;
    }
  },
  beforeRouteEnter (to, from, next) {
    let code  = businessText[to.params.code];
    to.meta.title = `新增${code.slice(-4)}`;
    next();
  },
  created(){
    this.$loading.show();
    let {transCode} = this.$route.query;
    if(transCode){
      this.transCode = transCode;
    }
    let {code} = this.$route.params;
    document.title = `新增${businessText[code]}`;
    this.currentComponent = require(`components/apply/${code}Form.vue`).default;
  },
  beforeRouteLeave(to, from, next) {
    let {path} = to;
    // 新建物料，修改列表页的meta值
    if (this.submitSuccess && (path.indexOf('/list') !== -1 ||path.indexOf('/msglist') !== -1)) {
      to.meta.reload = true;
    }
    //删除缓存的往来信息
    if(to.name === "LIST"){
      sessionStorage.removeItem('DEALERLIST_SELITEMS');
    }
    //离开数据保存为草稿
    let keys = Object.keys(this.saveData)[0];
    if(to.name === "LIST" && keys && !this.transCode && !this.submitSuccess){
      this.$vux.confirm.show({
        content:'即将离开，是否保存数据？',
        onConfirm : ()=>{
          sessionStorage.setItem(keys,JSON.stringify(this.saveData[keys]));
          next();
        },
        onCancel : ()=>{
          sessionStorage.removeItem(keys);
          next();
        }
      })
      return
    }
    next()

  },
}
</script>

<style lang='scss'>
</style>
