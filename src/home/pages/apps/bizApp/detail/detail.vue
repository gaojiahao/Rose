<template>
  <div class="pages">
    <div class="pages" ref='detail'>
      <component
        :is='currentComponent'
        v-model='showLoadding'
        @change='modifyRoute'
        @refresh-scroll="refresh">
      </component>
    </div>
    <!-- 页面进入加载动画-->
    <loadding-form :show='showLoadding'></loadding-form>
    <submit-load :submit='submitLoadding'></submit-load>
  </div>

</template>

<script>
  import LoaddingForm from 'components/Loading'
  import SubmitLoad from 'components/submitLoading'
  import businessText from './../../../maps/businessText'
  import Bscroll from 'better-scroll'

  export default {
    data() {
      return {
        currentComponent: '',
        showLoadding: true,
        transCode: '',
        submitSuccess: false,
        detailScroll: null,
        submitLoadding: false
      }
    },
    components: {
      LoaddingForm,
      SubmitLoad
    },
    watch:{
      $route:{
        handler(to,from){
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
          this.$event.$on('detail-show-loading', this.modifyRoute)
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
      to.meta.title = `${code.slice(-4)}详情`;
      next();
    },
    created() {
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
      this.$event.$on('detail-show-loading', this.modifyRoute)
    },
    mounted() {
      this.$nextTick(() => {
        this.detailScroll = new Bscroll(this.$refs.detail, {
          click: true,
        })
      })
    },
    beforeRouteLeave(to, from, next) {
      let {path} = to;
      this.$event.$off('detail-show-loading', this.modifyRoute)
      // 新建物料，修改列表页的meta值
      if (this.submitSuccess && (path.indexOf('/list') !== -1 || path.indexOf('msglist') !== -1)) {
        to.meta.reload = true;
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

</style>
