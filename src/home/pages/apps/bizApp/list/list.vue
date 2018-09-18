<template>
  <div class="inPage">
    <component
      :is='currentComponent'
      :refresh-request='isrefresh'
      ref='list'>
    </component>
    <router-view></router-view>
  </div>

</template>

<script>
// 引入映射表
import Apps from '../maps/Apps'
export default {
  data(){
    return {
      currentComponent : '',
      code :'',
      isrefresh : false,
    }
  },
  created(){
    let code = this.$route.params.code;
    if(code){
      this.code = code;
      this.$loading.show();
      this.currentComponent = require(`components/list/${Apps[code]}_List.vue`).default;
    }
  },
  beforeRouteEnter (to, from, next) {
    let { name } = to.query;
    // 合规财务报表的title不需要重定义
    if(name.includes('合规')){
      to.meta.title = name;
      next();
    }
    to.meta.title = name + '列表';
    next();
  },
  activated() {
    let reload = this.$route.meta.reload;
    setTimeout(() => {
      this.$refs.list.changeVisitedStatus && this.$refs.list.changeVisitedStatus();
    });
    if (reload) {
      let code = this.$route.params.code;
      this.$loading.show();
      if (code) {
        // 在提交页面提交成功时进入该判断
        if (this.code === code && this.currentComponent) {
          this.$refs.list.reloadData();
        }
        this.code = code;
        this.currentComponent = require(`components/list/${Apps[code]}_List.vue`).default;
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

<style lang='scss'></style>
