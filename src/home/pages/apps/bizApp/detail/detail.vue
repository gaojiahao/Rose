<template>
  <div class="pages">
    <div class="pages" ref='detail'>
      <component
        :is='currentComponent'
        @change='modifyRoute'
        @refresh-scroll="refresh"
        ref="detailComponent">
      </component>
    </div>
    <!-- 页面进入加载动画-->
    <!-- <loadding-form :show='showLoadding'></loadding-form> -->
  </div>

</template>

<script>
  import businessText from './../../../maps/businessText'
  import Bscroll from 'better-scroll'
  export default {
    data() {
      return {
        currentComponent: '',
        transCode: '',
        submitSuccess: false,
        detailScroll: null,
      }
    },
    watch:{
      $route:{
        handler(to,from){
          let {code = ''} = to.params;
          let fromCode = from.params.code || '';
          try {
            // 从相关实例进入另一个详情
            if (to.name === 'DETAIL') {
              this.currentComponent = require(`components/detail/${code}Form.vue`).default;
              // 如果进入的应用与当前应用相同，需要调用该方法请求数据
              if (fromCode === code) {
                this.$nextTick(() => {
                  this.$refs.detailComponent.loadPage();
                })
              }
            }
          } catch (e) {
            this.$vux.alert.show({
              content: '抱歉，无法支持该应用的查看',
              onHide: () => {
                this.$router.go(-1);
              }
            });
          }
          this.$nextTick(() => {
            this.detailScroll = new Bscroll(this.$refs.detail, {
              click: true,
            })
          })
          // this.$event.$on('detail-show-loading', this.modifyRoute)
          document.title = `${businessText[code].slice(-4)}详情`;
        }
      }

    },
    methods: {
      modifyRoute(val) {
        this.submitSuccess = val;
      },
      // TODO 刷新better-scroll
      refresh() {
        this.detailScroll.refresh();
      }
    },
    beforeRouteEnter(to, from, next) {
      let code = businessText[to.params.code];
      to.meta.title = `${code}详情`;
      next();
    },
    created() {
      this.$loading.show();
      let {code = ''} = this.$route.params;
      try {
        this.currentComponent = require(`components/detail/${code}Form.vue`).default;
      } catch (e) {
        this.$vux.alert.show({
          content: '抱歉，无法支持该应用的查看',
          onHide: () => {
            this.$router.go(-1);
          }
        });
      }
      // this.$event.$on('detail-show-loading', this.modifyRoute)
      // this.$event.$on('detail-show-loading',(val)=>{
      //   this.submitLoadding = val;
      // })
      this.$nextTick(() => {
        this.detailScroll = new Bscroll(this.$refs.detail, {
          click: true,
        })
      })
    },
    mounted() {

    },
    beforeRouteLeave(to, from, next) {
      let {path} = to;
      this.$HandleLoad.hide();
      // 新建物料，修改列表页的meta值
      if (this.submitSuccess && (to.name === 'LIST' || to.name === 'MSGLIST')) {
        to.meta.reload = true;
        from.meta.isHandle = true;
      }
      next();
    }

  }
</script>

<style lang='scss' scoped>
  .apply_detail {
    width: 100%;
    height: 100%;
    overflow: hidden;
  }
  .pages {
    background: #F4F4F4;
  }   
</style>
