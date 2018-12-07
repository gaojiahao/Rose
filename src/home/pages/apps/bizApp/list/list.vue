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
      fileId :'',
      currentComponent : '',
      isrefresh : false,
    }
  },
  created(){
    
    /*
    * AppsFile[fileId] => 应用类型文件夹
    * Apps[fileId][listId] => 应用名称.vue 
    * childId => 分类id （不一定存在）
    */    
    let { fileId, listId } = this.$route.params,
        { childId } = this.$route.query;
    this.fileId = fileId;
    if(fileId){
      if(childId) {
        this.currentComponent = require(`components/list/${AppsFile[fileId]}/${Apps[fileId][childId][listId]}_List.vue`).default;
      }
      else {
        this.currentComponent = require(`components/list/${AppsFile[fileId]}/${Apps[fileId][listId]}_List.vue`).default;
      }
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
    if (reload) {
      let { fileId, listId } = this.$route.params,
          { childId } = this.$route.query;
      this.$loading.show();
      if (fileId) {
        // 在提交页面提交成功时进入该判断
        if (this.fileId === fileId && this.currentComponent) {
          this.$refs.list.reloadData();
        }
        this.fileId = fileId;
        if(childId) {
          this.currentComponent = require(`components/list/${AppsFile[fileId]}/${Apps[fileId][childId][listId]}_List.vue`).default;
        }
        else {
          this.currentComponent = require(`components/list/${AppsFile[fileId]}/${Apps[fileId][listId]}_List.vue`).default;
        }
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
  }
}
</script>

<style lang='scss'>
</style>
