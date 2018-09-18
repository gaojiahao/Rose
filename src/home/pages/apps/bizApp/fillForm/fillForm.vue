<template>
  <div class="pages">
    <component
      :is='currentComponent'
      @sel-data='selData'
      @change='modifyRoute'>
    </component>
  </div>

</template>

<script>
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
  methods:{
    //提交,终止成功
    modifyRoute(val){
      this.submitSuccess = val;
    },
    //保存草稿
    selData(val){
      this.saveData = val;
    }
  },
  beforeRouteEnter (to, from, next) {
    let { name } = to.query;
    to.meta.title = `新增${name}`;
    next();
  },
  created(){
    this.$loading.show();
    let {transCode} = this.$route.query;
    if(transCode){
      this.transCode = transCode;
    }
    let { code } = this.$route.params;
    this.currentComponent = require(`components/apply/${code}Form.vue`).default;
  },
  beforeRouteLeave(to, from, next) {
    let {path} = to;
    let keys = Object.keys(this.saveData)[0];
    // 新建物料，修改列表页的meta值
    if (this.submitSuccess && (to.name === 'LIST' || to.name === 'MSGLIST')) {
      to.meta.reload = true;
      if(keys){
        sessionStorage.removeItem(keys)
      }     
    }
    //删除缓存的往来信息
    if(to.name === "LIST"){
      sessionStorage.removeItem('DEALERLIST_SELITEMS');
    }
    //离开数据保存为草稿
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
