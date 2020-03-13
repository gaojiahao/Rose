<template>
  <div v-transfer-dom class="grid-detail">
    <popup
      class="grid-detail-container"
      height="33.33%"
      v-model="showPop"
      @on-show="onShow"
      @on-hide="onHide"
    >
      <video width="100%" height="100%"  preload="auto" controls v-if="showPop">
        <source :src="playerSrc" type="video/mp4">
        您的浏览器不支持 HTML5 video 标签。
      </video>
    </popup>
  </div>
</template>

<script>
import Vue from "vue";
import girdDetailMix from "mixins/gridDetail";
import { XInput, numberComma, Popup } from "vux";
import gridFieldFactoryWx from "./GridFieldFactoryWx";
import RScroll from "plugins/scroll/RScroll";
import { toFixed } from "@/plugins/calc";
import { setTimeout } from "timers";

var component = {
  mixins: [girdDetailMix],
  props: {
    playerSrc: {
      type: String,
      default: ''
    }
  },
  components: {
    Popup,
    RScroll,
    gridFieldFactoryWx,
    XInput
  },
  data() {
    return {
      showPop: true,
      values: {},
      readOnlyParts: [],
      showKeyboard:false,
      editParts: [],
      onlyViewParts: [],
      title: null,
      titleKey: null
    };
  },
  computed: {

  },
  methods: {
    onShow() {
      this.$nextTick(() => {
        if (this.$refs.bScroll) {
          // 弹窗展示时刷新滚动，防止无法拖动问题
          this.$refs.bScroll.refresh();
          this.$refs.bScroll.scrollTo(0, 0);
        }
        this.clientHeight = document.documentElement.clientHeight;
      });
    },
    onHide() {
      this.$emit("deal-value-null",1);
      setTimeout(() => {
        this.$emit("input", false);
      }, 500);
    },
    // 隐藏弹窗
    hidePop() {
      this.showPop = false;
    },
  },
  created() {

  }
};
export default Vue.component("PlayerPop", component);
</script>

<style lang="scss">
@import "~@/scss/color";
.grid-detail-container {
  width: 100%;
  color: #333;
  z-index: 501;
  box-sizing: border-box;
  background-color: rgba(0, 0, 0, 0.5);
  top: 33.33%;
  &.has-edit {
    .scroll-container {
      // padding-bottom: 0.44rem;
    }
  }
  &.is-focus {
    .scroll-container {
      // padding-bottom: 0.44rem;
    }
    .confirm_btn {
      display: none;
    }
  }
  .vux-1px-t:before {
    border-color: #e8e8e8;
  }

  .popup-top {
    display: flex;
    align-items: center;
    height: 0.4rem;
    background-color: #fff;
    .popup-header {
      font-weight: 600;
      font-size: 0.16rem;
      line-height: 0.17rem;
      background-color: #fff;
      padding: 0.05rem 0.15rem 0.1rem;
      flex: 1;
    }
    .icon-close {
      width: 0.14rem;
      height: 0.14rem;
      margin-right: 0.1rem;
    }
  }

  .scroll-container {
    // padding-bottom: 0.44rem;
    height: calc(100% - 0.8rem);
  }

  .readOnlyPart {
    padding: 0.15rem;
    background-color: #fff;
    line-height: 0.22rem;
    font-size: 0.12rem;
    margin-bottom: 0.1rem;
    span:nth-child(2n + 1) {
      color: #aaa;
    }
    span:nth-child(2n) {
      font-weight: 400;
      font-size: 0.13rem;
    }
    .item {
      display: inline-flex;
      margin-right: 0.2rem;
    }
  }

  .edit-part {
    color: #fff;
    margin: 0.1rem 0;
    padding: 0 0.09rem;
  }
.vux-1px-b:not([style*="display:none"]):last-child:after{
  border-bottom: none;
}
  /* 其他数据 */
  .onlyView-parts {
    padding: 0 0.15rem 0rem;
    background-color: #fff;
    .onlyView-item {
      display: -webkit-box;
      display: -ms-flexbox;
      display: flex;
      -webkit-box-pack: justify;
      -ms-flex-pack: justify;
      justify-content: space-between;
      line-height: 0.30rem;
      font-size: 0.14rem;
      .title {
        color: #999;
        max-width: 30%;
      }
      .value {
       max-width: 70%;
       word-break: break-all;
      }
    }
    
  }

  /* 时间部分 */
  .matter-date {
    padding: 0.24rem 0.15rem 0.08rem;
    background-color: #fff;
    .matter_date_item {
      display: flex;
      line-height: 0.12rem;
      color: #696969;
      font-size: 0.12rem;
      & + .matter_date_item {
        margin-top: 0.12rem;
      }
    }
  }

  /* 说明 */
  .comment {
    padding: 0.24rem 0.15rem 0.19rem;
    background-color: #fff;
    .matter_comment_title {
      line-height: 0.17rem;
      font-size: 0.16rem;
      font-weight: 600;
    }
    .matter_comment_value {
      margin-top: 0.16rem;
      line-height: 0.2rem;
      font-size: 0.14rem;
    }
  }

  /* 编辑部分 */
  .edit-part {
    margin: 0.1rem 0;
    background-color: #fff;
    color: #333;
    .required {
      color: $main_color;
    }
    .weui-cell {
      padding: 0.15rem;
      line-height: 0.2rem;
      font-size: 0.14rem;
      &:before {
        display: none;
      }
      &:after {
        border-color: #e8e8e8;
      }
      /deep/ .weui-cell__hd {
        color: #696969;
      }
    }
  }

  //确认按钮
  .confirm_btn {
    position: fixed;
    left: 0;
    bottom: 0;
    width: 100%;
    box-sizing: border-box;
    background: #fff;
    .confirm {
      width: 100%;
      height: 0.44rem;
      line-height: 0.44rem;
      @include bg_color();
      color: #fff;
      text-align: center;
    }
  }
}
</style>
