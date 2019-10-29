<template>
  <div v-transfer-dom>
    <popup class="popup-matter-container" :class="{'has-edit': hasEditPart, 'is-focus': btnIsHide}" height="80%"
           v-model="showPop">
      <div class="popup-top">
        <i class="icon-close" @click="hidePop"></i>
      </div>
      <header class="popup-header">其他信息</header>
      <r-scroll ref="bScroll">
        <div class="matter-main">
          <img class="matter_img" :src="item.inventoryPic" alt="mater_img" @error="getMatterDefault(item)">
          <div class="matter_info">
            <div class="matter_name">
              {{item.inventoryName_transObjCode || item.inventoryName_outPutMatCode || item.facilityName_facilityObjCode || '该物料未获取到名称，请检查物料信息。'}}
            </div>
            <div class="matter_info_item flex-start">
              <div class="matter_detail">
                <span class="matter_item_title">属性：</span>
                <span class="matter_item_value">{{item.tdProcessing || '无'}}</span>
              </div>
              <div class="matter_detail">
                <span class="matter_item_title">产品规格：</span>
                <!-- <span class="matter_item_value">{{item.specification_transObjCode || item.specification_outPutMatCode || item.facilitySpecification_facilityObjCode || item.assMeasureDescription || '无'}}</span> -->
                <span class="matter_item_value">{{item.specification_transObjCode  || item.specification_outPutMatCode || item.assMeasureDescription ||  '无'}}</span>
              </div>
            </div>
            <div class="matter_info_item">
              <div class="matter_detail">
                <span class="matter_item_title">编码：</span>
                <span class="matter_item_value">{{item.transObjCode || item.facilityObjCode || '无'}}</span>
              </div>
            </div>
          </div>
        </div>
        <div class="matter-edit-part" v-if="hasEditPart">
          <div v-for="(eItem, eIndex) in editParts" :key="eIndex">
            <x-input class="vux-1px-b" type="number" v-model.number='item[eItem.fieldCode]'
                     text-align="right"
                     placeholder="请输入"
                     v-if="(eItem.editorType === 'r2Numberfield' || eItem.editorType === 'r2Percentfield' || eItem.editorType === 'r2Permilfield')"
                     @on-blur="checkAmt(item, eItem.fieldCode, item[eItem.fieldCode])"
                     @on-focus="getFocus($event)">
              <template slot="label">
                <span :class="{required: !eItem.allowBlank}">{{eItem.text}}</span>
              </template>
            </x-input>
          </div>
        </div>
        <div class="matter-other">
          <div class="matter_other_item" v-for="(other, index) in readOnlyParts" :key="index">
            <span class="matter_other_title">{{other.text}}</span>
            <span>{{other.value}}</span>
          </div>
        </div>
        <div class="matter-date vux-1px-t" v-if="hasDate">
          <div class="matter_date_item" v-for="(date, index) in item.dates" :key="index">
            <span class="matter_date_title">{{date.text}}：</span>
            <span>{{date.value}}</span>
          </div>
        </div>
        <div class="matter-comment" :class="{'vux-1px-t': !hasDate}"
             v-if="item.matterComment && item.matterComment.text">
          <div class="matter_comment_title">{{item.matterComment.text}}</div>
          <div class="matter_comment_value">{{item.matterComment.value}}</div>
        </div>
      </r-scroll>
      <div class='confirm_btn' @click="confirm" v-if="hasEditPart">
        <div class='confirm'>确认</div>
      </div>
    </popup>
  </div>
</template>

<script>
  import {XInput, numberComma, Popup} from 'vux'
  import RScroll from 'plugins/scroll/RScroll'
  import {toFixed} from '@/plugins/calc'

  export default {
    name: "PopMatterDetail",
    props: {
      show: {
        type: Boolean,
        default: false
      },
      item: {
        type: Object,
        default() {
          return {}
        }
      },
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
      Popup, RScroll, XInput,
    },
    data() {
      return {
        showPop: false,
        editParts: [],
        readOnlyParts: [],
      }
    },
    computed: {
      // 是否含时间块
      hasDate() {
        let {dates = []} = this.item;
        return dates && dates.length
      },
      // 是否有可编辑部分
      hasEditPart() {
        return !!this.editParts.length
      },
      // 是否显示 产品规格
      showSpec() {
        let item = this.item;
        let spec = item.specification_transObjCode || item.specification_outPutMatCode || item.facilitySpecification_facilityObjCode || item.assMeasureDescription ;
        return !!spec;
      }
    },
    watch: {
      show: {
        handler(val) {
          this.showPop = val;
        },
        immediate: true
      },
      showPop: {
        handler(val) {
          this.$emit('input', val);
        },
        immediate: true
      },
      item: {
        handler(val) {
          // *部分应用* 物料详情在审批节点可以重新录入数据 此处进行数据分割
          let {others = []} = val;
          let editParts = [];
          let readOnlyParts = [];
          others.forEach(item => {
            // 当Grid组件只读为false时 各个字段的readOnly才能启用
            if (item.r2GridXtype && !item.r2GridXtype.readOnly) {
              item.readOnly ? readOnlyParts.push(item) : editParts.push(item);
              return;
            }
            readOnlyParts.push(item);
          });
          this.editParts = editParts;   // 可编辑部分
          this.readOnlyParts = readOnlyParts;   // 只读部分
        },
        immediate: true,
        deep: true
      }
    },
    methods: {
      //选择默认图片
      getMatterDefault(item) {
        let url = require('assets/wl_default03.png');
        if (item) {
          item.inventoryPic = url;
        }
        return url
      },
      // 隐藏弹窗
      hidePop() {
        this.showPop = false;
      },
      // 确定修改
      confirm() {
        let warn = '';
        let matter = this.item;
        this.editParts.every(eItem => {
          let val = matter[eItem.fieldCode];
          if (!eItem.allowBlank) {
            // if ((Array.isArray(val) && !val.length) || !val) {
            if (!val && val !== 0) {
              warn = eItem.text + '不能为空';
              return false
            }
          }
          matter[eItem.fieldCode] = val;
          return true
        });
        if (warn) {
          this.$vux.alert.show({
            content: warn
          });
          return
        }
        this.$emit('on-confirm', matter);
        this.showPop = false;
      },
      //输入框获取焦点时内容选中
      getFocus(e) {
        event.currentTarget.select();
      }
    },
  }
</script>

<style scoped lang="scss">
  @import '~@/scss/color';
  .popup-matter-container {
    width: 100%;
    color: #333;
    box-sizing: border-box;
    background-color: #f6f6f6;
    &.has-edit {
      .scroll-container {
        height: calc(100% - 1.32rem);
      }
    }
    &.is-focus {
      .scroll-container {
        height: calc(100% - 0.62rem);
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
      justify-content: flex-end;
      align-items: center;
      padding: 0 .15rem;
      height: .4rem;
      background-color: #fff;
      .icon-close {
        display: inline-block;
        width: .14rem;
        height: .14rem;
      }
    }

    .popup-header {
      font-weight: 600;
      font-size: .16rem;
      line-height: .17rem;
      background-color: #fff;
      padding: .05rem .15rem .1rem;
    }

    .scroll-container {
      height: calc(100% - .62rem);
    }

    .matter-main {
      display: flex;
      padding: .24rem .15rem 0;
      background-color: #fff;
      .matter_img {
        width: .9rem;
        height: .9rem;
      }
      .matter_info {
        flex: 1;
        margin-left: .12rem;
      }
      .matter_name {
        line-height: .24rem;
        font-size: .16rem;
        font-weight: 500;
      }
      .matter_info_item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: .16rem;
        line-height: .12rem;
        font-size: .12rem;
        & + .matter_info_item {
          margin-top: .08rem;
        }
        &.flex-start {
          justify-content: flex-start;
          .matter_detail {
            & + .matter_detail {
              margin-left: .1rem;
            }
          }
        }
      }
      .matter_detail {
        display: flex;
      }
      .matter_item_title {
        color: #999;
      }
    }

    /* 其他数据 */
    .matter-other {
      padding: 0 .15rem .24rem;
      background-color: #fff;
      .matter_other_item {
        display: flex;
        justify-content: space-between;
        padding-top: .12rem;
        line-height: .14rem;
        font-size: .14rem;
      }
      .matter_other_title {
        color: #999;
      }
    }

    /* 时间部分 */
    .matter-date {
      padding: .24rem .15rem .08rem;
      background-color: #fff;
      .matter_date_item {
        display: flex;
        line-height: .12rem;
        color: #696969;
        font-size: .12rem;
        & + .matter_date_item {
          margin-top: .12rem;
        }
      }
    }

    /* 说明 */
    .matter-comment {
      padding: .24rem .15rem .19rem;
      background-color: #fff;
      .matter_comment_title {
        line-height: .17rem;
        font-size: .16rem;
        font-weight: 600;
      }
      .matter_comment_value {
        margin-top: .16rem;
        line-height: .2rem;
        font-size: .14rem;
      }
    }

    /* 编辑部分 */
    .matter-edit-part {
      margin: .1rem 0;
      background-color: #fff;
      color: #333;
      .required {
        color: $main_color;
      }
      .weui-cell {
        padding: .15rem;
        line-height: .2rem;
        font-size: .14rem;
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
      padding: 0.08rem .2rem;
      .confirm {
        width: 100%;
        height: 0.44rem;
        line-height: 0.44rem;
        border-radius: .04rem;
        background-color: $main_color;
        color: #fff;
        text-align: center;
      }
    }
  }
</style>
