<template>
  <!-- 分页组件 -->
  <div class="page-controler">
      <span class="each-page" @click="pagePrev" :class="{disabled: disabledPrev}"><i
        class="iconfont icon-jiantou-copy"></i></span>
    <span class="each-page page-num">{{page}}</span>
    <span class="each-page" @click="pageNext" :class="{disabled: disabledNext}"><i
      class="iconfont icon-jiantou"></i></span>
  </div>
</template>

<script>
  export default {
    name: "page_controller",
    props: {
      disabledPrev: { // 是否禁止点击上一页
        type: Boolean,
        default: true
      },
      disabledNext: { // 是否禁止点击下一页
        type: Boolean,
        default: true
      },
      page: { // 显示的页码
        type: Number,
        default: 1
      }
    },
    methods: {
      // TODO 点击上一页
      pagePrev() {
        if (this.disabledPrev) {
          return;
        }
        this.$emit('pageprev');
      },
      // TODO 点击下一页
      pageNext() {
        if (this.disabledNext) {
          return;
        }
        this.$emit('pagenext');
      },
    }
  }
</script>

<style lang="scss">
  // 分页栏
  .page-controler {
    width: 100%;
    height: 40px;
    line-height: 40px;
    text-align: center;
    display: flex;
    position: absolute;
    bottom: 0;
    left: 0;
    .each-page {
      flex: 1;
      font-size: 18px;
      &.disabled {
        color: #ccc;
      }
    }
  }
</style>