<template>
  <div class="inPage">
    <component :is="currentComponent" :refresh-request="isrefresh" ref="list"></component>
  </div>
</template>

<script>
export default {
  data() {
    return {
      folder: "",
      currentComponent: "",
      isrefresh: false
    };
  },
  methods: {
    initPage() {
      /*
       * folder => 应用类型文件夹
       * fileName => 应用名称.vue
       */

      this.$loading.show();
      let { folder, fileName } = this.$route.params;
      this.folder = folder;
      try {
        this.currentComponent = require(`components/list/${folder}/${fileName}_List.vue`).default;
      } catch (e) {
        console.log(e);
        this.$vux.alert.show({
          content: "抱歉，无法支持该应用的查看",
          onHide: () => {
            this.$router.go(-1);
          }
        });
      }
    }
  },
  created() {
    this.initPage();
  },
  activated() {
    let listPage = this.$refs.list,
      reload = this.$route.meta.reload;
    // 是否需要刷新列表
    if (reload) {
      let { folder, fileName } = this.$route.params;
      if (folder) {
        // 在提交页面提交成功时进入该判断
        if (this.folder === folder && this.currentComponent) {
          listPage.reloadData();
        }
        // 初始化页面
        this.initPage();
      }
      this.$route.meta.reload = false;
    }
    this.$nextTick(() => {
      if (listPage) {
        listPage.changeVisitedStatus && listPage.changeVisitedStatus();
        listPage.$refs.bScroll && listPage.$refs.bScroll.refresh();
      }
    });
  },
  beforeRouteEnter(to, from, next) {
    let { name, transCode } = to.query;
    // 合规财务报表的title不需要重定义
    if (name.includes("合规")) {
      to.meta.title = name;
      next();
    } else if (transCode) {
      to.meta.title = "加载中...";
    } else {
      to.meta.title = name + "列表";
    }
    next();
  },
  beforeRouteLeave(to, from, next) {
    let { path } = to;
    if (path === "/home") {
      this.$loading.hide();
      this.currentComponent = null;
      from.meta.reload = true;
    }
    next();
  }
};
</script>

<style lang='scss'>
</style>
