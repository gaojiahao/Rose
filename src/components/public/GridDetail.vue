<template>
  <div v-transfer-dom class="grid-detail">
    <popup
      class="grid-detail-container"
      :class="{'has-edit': hasEditPart, 'is-focus': btnIsHide}"
      height="60%"
      v-model="showPop"
      @on-show="onShow"
      @on-hide="onHide"
    >
      <div class="popup-top">
        <header class="popup-header">详细信息</header>
        <i class="icon-close" @click="hidePop"></i>
      </div>
      <r-scroll ref="bScroll">
        <div class="readOnlyPart" v-if="readOnlyParts.length">
          <template v-for="(item, index) in readOnlyParts">
            <div class="item" :key="index">
              <span >{{item.text}}：</span>
              <span v-if="item.editorType=='r2Percentfield'">{{formatByType(values[item.fieldCode],item.editorType)}}%</span>
              <span v-else>{{formatByType(values[item.fieldCode],item.editorType)}}</span>
            </div>
          </template>
        </div>
        <div class="edit-part" v-if="hasEditPart">
          <div class="r-fieldset">
            <grid-field-factory
              :cfg="col"
              :values="values"
              v-for="(col, eIndex) in editParts"
              :key="eIndex"
            />
          </div>
        </div>
        <div class="onlyView-parts" v-if="onlyViewParts.length">
          <div class="onlyView-item vux-1px-b" v-for="(item, index) in onlyViewParts" :key="index">
            <span class="title">{{item.text}}</span>
            <span class="value" v-if="item.editorType=='r2Percentfield'">{{formatByType(values[item.fieldCode],item.editorType)}}%</span>
            <span class="value" v-else>{{formatByType(values[item.fieldCode],item.editorType)}}</span>
          </div>
        </div>
      </r-scroll>
      <div class="confirm_btn" @click="confirm" v-if="hasEditPart" v-show="showKeyboard == false">
        <div class="confirm">确定</div>
      </div>
      <div class="confirm_btn" @click="showPop = false;" v-if="!hasEditPart" v-show="showKeyboard == false">
        <div class="confirm">关闭</div>
      </div>
    </popup>
  </div>
</template>

<script>
import Vue from "vue";
import girdDetailMix from "mixins/gridDetail";
import { XInput, numberComma, Popup } from "vux";
import gridFieldFactory from "./GridFieldFactory";
import RScroll from "plugins/scroll/RScroll";
import { toFixed } from "@/plugins/calc";
import { setTimeout } from "timers";

var component = {
  mixins: [girdDetailMix],
  props: {
    btnIsHide: {
      type: Boolean,
      default: false
    },
    checkAmt: {
      type: Function,
      default(item, key, val) {
        item[key] = Math.abs(toFixed(val));
      }
    }
  },
  components: {
    Popup,
    RScroll,
    gridFieldFactory,
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
    // 是否有可编辑部分
    hasEditPart() {
      return !!this.editParts.length;
    }
  },
  methods: {
    //选择默认图片
    getMatterDefault(item) {
      let url = require("assets/wl_default03.png");
      if (item) {
        item.inventoryPic = url;
      }
      return url;
    },
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
      setTimeout(() => {
        this.$emit("input", false);
      }, 500);
    },
    // 隐藏弹窗
    hidePop() {
      this.showPop = false;
    },
    // 确定修改
    confirm() {
      let warn = "";
      let values = this.values;
      this.editParts.every(eItem => {
        let val = values[eItem.fieldCode];
        if (!eItem.allowBlank) {
          if (!val && val !== 0) {
            warn = eItem.text + "不能为空";
            return false;
          }
        }
        return true;
      });
      if (warn) {
        this.$vux.alert.show({
          content: warn
        });
        return;
      }
      this.$emit("on-confirm", values);
      this.showPop = false;
    }
  },
  created() {
    var grid = this.$parent,
        cfg = grid.cfg,
        columns = cfg.columns;
    // *部分应用* 物料详情在审批节点可以重新录入数据 此处进行数据分割
    if (cfg.readOnly) {
      this.onlyViewParts = columns.filter(it => {
        return !it.hidden;
      });
    } else {
      let editParts = [];
      let readOnlyParts = [];
      columns
        .filter(it => {
          return !it.hidden;
        })
        .forEach(col => {
          // 当Grid组件只读为false时 各个字段的readOnly才能启用
          if (col.editorType && col.readOnly == false) {
            editParts.push(col);
          } else {
            readOnlyParts.push(col);
          }
        });
      this.editParts = editParts; // 可编辑部分
      this.readOnlyParts = readOnlyParts; // 只读部分
    }

    this.grid = grid;
    this.titleKey = columns[0].fieldCode;
    this.initFieldMap();
    this.initValueBind(this.grid.valueBindCfg);
    this.setValues(grid.detail);
    this.initKeyboardEvent();
  }
};
export default Vue.component("GridDetail", component);
</script>

<style lang="scss">
@import "~@/scss/color";
.grid-detail-container {
  width: 100%;
  color: #333;
  z-index: 500;
  box-sizing: border-box;
  background-color: #f6f6f6;
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
      background-color: $main_color;
      color: #fff;
      text-align: center;
    }
  }
}
</style>
