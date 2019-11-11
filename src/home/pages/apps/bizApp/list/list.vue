<template>
  <div class="inPage">
    <component :is="currentComponent" :refresh-request="isrefresh" ref="list"></component>
  </div>
</template>

<script>
import { isMyflow } from 'service/detailService'
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
        if (fileName == "null") {
          this.currentComponent = require(`components/list/CommonList.vue`).default;
        } else {
          this.currentComponent = require(`components/list/${folder}/${fileName}_List.vue`).default;
        }
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
  beforeCreate() {
    /*
     * 企业微信推送，第一层url跳转至此
     * 此处是判断——跳转至详情页还是提交页面
     * */
    this.$loading.show();
    this.redirect = false;
    let { folder, fileName} = this.$route.params,
      { name,listId,transCode } = this.$route.query;
    // 当路由当中包含transCode
    if (transCode) {
      isMyflow({ transCode }).then(({ tableContent }) => {
        let path = '';
        if (tableContent.length > 0) {
          let { isMyTask, nodeName } = tableContent[0];
          if (isMyTask === 1 && nodeName === '重新提交') {
            path = `/fillform/${listId}/0`;
          } else {
            path = `/detail/${listId}/0`;
          }
        } else {
          path = `/detail/${listId}/0`;
        }
        this.$router.replace({
          path, query: { name, folder,fileName,transCode }
        })
      });
      this.redirect = true;
    }
  },
  created() {
    if(this.redirect == false)this.initPage();
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
    let { name = "", transCode } = to.query;
    // 合规财务报表的title不需要重定义
    if (name.includes("合规")) {
      to.meta.title = name;
      next();
    } else if (transCode) {
      to.meta.title = "加载中...";
    } else {
      //to.meta.title = name + "-测试版";
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
