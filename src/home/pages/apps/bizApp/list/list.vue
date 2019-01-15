<template>
  <div class="inPage">
    <component
      :is='currentComponent'
      :refresh-request='isrefresh'
      ref='list'>
    </component>
  </div>
</template>

<script>
// 引入映射表
import Apps from '@/home/pages/maps/businessApp'
import AppsFile from '@/home/pages/maps/businessFile'
export default {
  data(){
    return {
      folder :'',
      currentComponent : '',
      isrefresh : false,
    }
  },
  created(){
    /*
    * folder => 应用类型文件夹
    * fileName => 应用名称.vue 
    */    
    this.$loading.show();
    let { folder, fileName } = this.$route.params;
    this.folder = folder;
    try {
      this.currentComponent = require(`components/list/${folder}/${fileName}_List.vue`).default;
    }
    catch(e) {
      console.log(e);
      this.$vux.alert.show({
        content: '抱歉，无法支持该应用的查看',
        onHide: () => {
          this.$router.go(-1);
        }
      });
    }
  },
  beforeRouteEnter (to, from, next) {
    let { name, transCode } = to.query;
    // 合规财务报表的title不需要重定义
    if(name.includes('合规')){
      to.meta.title = name;
      next();
    }
    if(transCode) {
      to.meta.title = '加载中...';
    }
    else {
      to.meta.title = name + '列表';
    }
    next();
  },
  activated() {
    let reload = this.$route.meta.reload;
    setTimeout(() => {
      this.$refs.list.changeVisitedStatus && this.$refs.list.changeVisitedStatus();
    });
    this.$nextTick(() => {
      if (this.$refs.list && this.$refs.list.$refs.bScroll) {
        this.$refs.list.$refs.bScroll.refresh();
      }
    })  
    if (reload) {
      let { folder, fileName } = this.$route.params;
      this.$loading.show();
      if (folder) {
        // 在提交页面提交成功时进入该判断
        if (this.folder === folder && this.currentComponent) {
          this.$refs.list.reloadData();
        }
        this.folder = folder;
        this.currentComponent = require(`components/list/${folder}/${fileName}_List.vue`).default;
      }
      this.$route.meta.reload = false;
    }
  },
  beforeRouteLeave (to, from, next) {
    let { path } = to;
    if(path === '/home'){
      this.$loading.hide();
      this.currentComponent = null;
      from.meta.reload = true;
    }
    next();
  },
}
</script>

<style lang='scss'>
</style>
