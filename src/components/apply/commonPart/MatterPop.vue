<template>
  <!-- 单个物料的编辑器 -->
  <div v-transfer-dom>
    <popup v-model="show" height="80%" @on-show="onShow" @on-hide="onHide">
      <div class="popup-top">
        <i class="icon-close" @click="onHide"></i>
      </div>
      <r-scroll class="matter-list-container" :options="scrollOptions" ref="bScroll">
        <div class='matter-info'>
          <img :src="chosenMatter.inventoryPic" alt="matter_img" @error="getDefaultImg(item)" class='matter_img'/>
          <div class='mater_main'>
            <div class="mater_name">
              {{chosenMatter.inventoryName || chosenMatter.invName || chosenMatter.facilityName || chosenMatter.inventoryName_outPutMatCode}}
            </div>
            <!-- 物料基本信息 -->
            <div class="matter_info">
              <div class="matter_info_item" v-for="(item, index) in config.property" :key="index">
                <span class="matter_info_title">{{item.text}}: </span>
                <span class="matter_info_value">
                  {{
                    chosenMatter[item.fieldCode] 
                      ? chosenMatter[item.fieldCode] 
                      : (chosenMatter[item.showFieldCode] ? chosenMatter[item.showFieldCode] : '无')
                  }}
                </span>
              </div>
            </div>
          </div>
        </div>
        <group gutter="0" class="matter-edit-part">
          <div v-for="(eItem,eIndex) in config.editPart" :key="eIndex">
            <template v-if="!eItem.readOnly">
              <!-- 数字输入框 -->
              <x-input class="vux-1px-b" type="number" v-model.number='chosenMatter[eItem.fieldCode]'
                       text-align="right"
                       placeholder="请输入"
                       v-if="(eItem.editorType === 'r2Numberfield' || eItem.editorType === 'r2Percentfield' || eItem.editorType === 'r2Permilfield') && eItem.fieldCode !=='tdQty'"
                       @on-blur="checkAmt(chosenMatter, eItem.fieldCode, chosenMatter[eItem.fieldCode])"
                       @on-focus="getFocus($event)">
                <template slot="label">
                  <span :class="{required: !eItem.allowBlank}">{{eItem.text}}</span>
                </template>
              </x-input>
              <!--文字输入框-->
              <x-input class="vux-1px-b" v-model='chosenMatter[eItem.fieldCode]' text-align="right" placeholder="请输入"
                       v-if="eItem.editorType === 'r2Textfield'">
                <template slot="label">
                  <span :class="{required: !eItem.allowBlank}">{{eItem.text}}</span>
                </template>
              </x-input>
              <!--处理销售订单订单数量会根据客户，物料，物料上线和下线，自动带出单价，税率-->
              <x-input class="vux-1px-b" type="number" v-model.number='chosenMatter[eItem.fieldCode]'
                       text-align="right"
                       placeholder="请输入" v-if="eItem.fieldCode ==='tdQty'"
                       @on-blur="checkAmt(chosenMatter, eItem.fieldCode, chosenMatter[eItem.fieldCode])"
                       @on-focus="getFocus($event)"
                       @on-click-clear-icon="cleanAmt(chosenMatter)">
                <template slot="label">
                  <span :class="{required: !eItem.allowBlank}">{{eItem.text}}</span>
                  <!-- 提示按钮 -->
                  <span class="iconfont icon-tishi" v-if="chosenMatter.priceRange && chosenMatter.priceRange.length"
                        @click="showDialog = !showDialog"></span>
                </template>
              </x-input>
              <!--日期-->
              <datetime class="vux-1px-b" v-model="chosenMatter[eItem.fieldCode]" placeholder="请选择"
                        v-if="eItem.editorType === 'r2Datefield'">
                <template slot="title">
                  <span :class="{required: !eItem.allowBlank}">{{eItem.text}}</span>
                </template>
              </datetime>
              <!-- 下拉框 -->
              <r-picker class="picker vux-1px-b" :title="eItem.text" :data="eItem.remoteData" v-model="chosenMatter[eItem.fieldCode]"
                        :required="!eItem.allowBlank" placeholder="请选择" v-if="eItem.editorType === 'r2Combo'">
              </r-picker>
              <!-- 下拉框plus -->
              <r-picker class="picker vux-1px-b" :title="eItem.text" :data="eItem.remoteData" v-model="chosenMatter[eItem.fieldCode]"
                        :required="!eItem.allowBlank" placeholder="请选择" v-if="eItem.editorType === 'r2SelectorPlus'">
              </r-picker>
            </template>
            <!--字段不可编辑-->
            <template v-else>
              <!--字段为数字时，显示千分符-->
              <cell class="vux-1px-b" disabled :title="eItem.text"
                    :value="chosenMatter[eItem.fieldCode] || chosenMatter[eItem.showFieldCode] | checkNumber"
                    v-if="eItem.editorType === 'r2Numberfield'"></cell>
              <cell class="vux-1px-b" disabled :title="eItem.text"
                    :value="chosenMatter[eItem.fieldCode] || chosenMatter[eItem.showFieldCode]" v-else></cell>
            </template>
          </div>
        </group>
      </r-scroll>
      <div class='confirm_btn' :class="{btn_hide : btnIsHide}" @click="confirm">
        <div class='confirm'>确认</div>
      </div>
    </popup>
    <x-dialog class="dialog-view" v-model="showDialog" hide-on-blur scroll>
      <div class="dialog-box">
      <div class="tip-top">
        <p class="header_content">温馨提示</p>
        <p class="header_btn_tips">订单折合包装比: {{chosenMatter.assMeasureScale}}</p>
      </div>
      <div class="tip-main" v-for="(item, index) of chosenMatter.priceRange" :key="index">
        <p class="serial-part" v-if="chosenMatter.priceRange.length > 1">阶梯{{index + 1}}</p>
        <div class="each-info-part">
          <span class="package_num">订单数量上限: {{item.qtyOnline * chosenMatter.assMeasureScale | numberComma}}</span>
          <span class="order_num">[折合包装数量: {{item.qtyOnline | numberComma}}]</span>
        </div>
        <div class="each-info-part">
          <span class="package_num">订单数量下限: {{item.qtyDownline * chosenMatter.assMeasureScale | numberComma}}</span>
          <span class="order_num">[折合包装数量: {{item.qtyDownline | numberComma}}]</span>
        </div>
        <div class="each-info-part">
          <span class="order_num">标准价格: ￥{{item.price | numberComma}}</span>
          <span class="order_num">特批底价: ￥{{item.specialReservePrice | numberComma}}</span>
        </div>
      </div>
      <div class="other-info-part">
        <p class="other_tips">tips: 当您输入的数量在上述区间内，系统将会自动显示其他信息，并自动计算。
        </p>
      </div>
      <div class="btn-part" @click="showDialog = !showDialog">我已阅读</div>
      </div>
    </x-dialog>
  </div>
</template>

<script>
  // vux组件引入
  import {
    Cell, Group, Popup, XDialog,
    XInput, Datetime, PopupPicker,
    numberComma, dateFormat
  } from 'vux'
  //组件引入
  import RScroll from 'plugins/scroll/RScroll'
  import RPicker from 'components/public/basicPicker'
  import {toFixed} from '@/plugins/calc'
  import {accAdd, accMul} from 'plugins/calc/decimalsAdd'

  export default {
    name: 'MatterPop',
    filters: {
      numberComma,
      checkNumber(val) {
        if (val) {
          return numberComma(val, 3)
        }
        return val
      }
    },
    props: {
      // 此处为校验方法 建议每个应用单独定义一份
      checkAmt: {
        type: Function
      },
      chosenMatter: {    // 进行修改的单个物料信息
        type: Object,
        default() {
          return {}
        }
      },
      showDateTime: {   // 是否展示时间选择栏
        type: Boolean,
        default: false
      },
      showPop: {
        type: Boolean,
        default: false
      },
      btnIsHide: {      // 底部按钮是否隐藏
        type: Boolean,
        default: false
      },
      isCheckStock: {   // 校验数量是否大于库存
        type: Boolean,
        default: true
      },
      isShowAmount: {  // 是否展示金额，税金，价税小计
        type: Boolean,
        default: true
      },
      dateText: {
        type: String,
        default: '预期交货日'
      },
      // 校验的字段
      validateMap: {
        type: Array,
        default() {
          return []
        }
      },
      config: {
        type: Object,
        default() {
          return {}
        }
      }
    },
    components: {
      Cell, Group, Popup, XDialog,
      XInput, Datetime, RScroll, PopupPicker, RPicker
    },
    watch: {
      showPop: {
        handler(val) {
          this.show = val;
        }
      },
      // 监听用于根据（生产日期+保质期天数）计算有效期
      chosenMatter: {
        handler(val) {
          if(val.warehouseName_containerCodeOut) {
            for (let dItem of this.config.editPart){
              if (dItem.fieldCode == "warehouseName_containerCodeOut"){
                for(var i=0 ;i < dItem.remoteData[0].length; i++){
                  if(val.warehouseName_containerCodeOut == dItem.remoteData[0][i].warehouseCode) {
                    this.chosenMatter.containerCodeOut = dItem.remoteData[0][i].warehouseCode;
                    //this.chosenMatter.warehouseName_containerCodeOut = dItem.remoteData[0][i].warehouseName;
                    break;
                  }
                }
                break;
              }
            }
          }
          //处理库区信息
          for(let dItem of this.config.editPart){
            if(dItem.fieldCode == 'warehouseName_storehouseOutCode') {
              console.log(dItem.dataSource);
              let url =dItem.dataSource.data.url,
                  params = dItem.dataSource.data.params,
                  keys = Object.keys(params),
                  requestParams = {url};
              if (keys.length) {
                let data = {};
                keys.forEach(key => {
                  data[key] = params[key].value;
                })
                requestParams.data = data;
              }
              console.log(requestParams.data);
            }
          }
          // let url = item.dataSource.data.url,
          //     params = item.dataSource.data.params,
          //     keys = Object.keys(params),
          //     requestParams = {url};
          // if (keys.length) {
          //   let data = {};
          //   keys.forEach(key => {
          //     data[key] = params[key].value;
          //   })
          //   requestParams.data = data;
          // }
          // if (item.fieldCode.includes('warehouse')) {
          //   requestData(requestParams).then(({tableContent = []}) => {
          //     let arr = [];
          //     tableContent.forEach(item => {
          //       item.name = item.warehouseName;
          //       item.value = item.warehouseCode;
          //       item.parent = index;
          //       arr.push(item);
          //     })
          //     item.remoteData = [arr];
          //   })
          // }
          if (val.productionDate && val.keepingDays) {
            let productionDate = new Date(val.productionDate).getTime(),
            day = 24 * 3600 * 1000;
           val.validUntil = productionDate ? dateFormat(productionDate + accMul(val.keepingDays, day), 'YYYY-MM-DD') : '';
          } 
        },
        deep: true
      }
    },
    data() {
      return {
        show: false,
        showDialog: false,
        scrollOptions: { // 滚动配置
          click: true,
        },
        pickerStyle: {zIndex: 550},
      }
    },
    methods: {
      numberComma(val) {
        if (!val && val !== 0) {
          return '无';
        }
        return numberComma(val);
      },
      // 弹窗展示时调用
      onShow() {
        this.$nextTick(() => {
          if (this.$refs.bScroll) {
            // 弹窗展示时刷新滚动，防止无法拖动问题
            this.$refs.bScroll.refresh();
            this.$refs.bScroll.scrollTo(0, 0);
          }
          this.clientHeight = document.documentElement.clientHeight;
        })
      },
      // 弹窗隐藏时调用
      onHide() {
        this.showPrice = false;
        this.currentType = '渠道价';
        this.$emit('input', false);
        // 触发父级事件，强制关闭PopMatter
        this.$emit('show-down-modify', false);
      },
      //确认修改
      confirm() {
        let warn = '';
        this.config.editPart.every(item => {
          if (!item.allowBlank) {
            if ((Array.isArray(this.chosenMatter[item.fieldCode]) && !this.chosenMatter[item.fieldCode].length) || (!this.chosenMatter[item.fieldCode])) {
              warn = item.text + '不能为空';
              return false
            }
          }
          return true
        });
        if (warn) {
          this.$vux.alert.show({
            content: warn
          });
          return
        }
        this.$emit('sel-confirm', JSON.stringify(this.chosenMatter))
        this.show = false;
      },
      //选择默认图片
      getDefaultImg(item) {
        let url = require('assets/wl_default03.png');
        if (item) {
          item.inventoryPic = url;
        }
        return url
      },
      // 根据传进来的对象 定义参数的值
      defineObjVal(currentData, newObj, newVal) {
        for (let key in newObj) {
          this.$set(currentData, key, newVal[key]);
        }
      },
      cleanAmt(item) {
        this.defineObjVal(item, item.otherField, '')
      },
      //输入框获取焦点时内容选中
      getFocus(e) {
        event.currentTarget.select();
      },
    }
  }
</script>

<style lang="scss" scoped>
  @import '~@/scss/color';
  .vux-1px-b:after{
    border-color: #e8e8e8;
    left: 0;
  }
  .vux-popup-dialog {
    background: #f6f6f6;
  }
  .required {
    color: $main_color;
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

  .matter-list-container {
    width: 100%;
    overflow: hidden;
    box-sizing: border-box;
    height: calc(100% - 1rem);
    .icon-tishi {
      margin: .02rem 0 0 .02rem;
    }
  }

  //物料信息
  .matter-info {
    display: flex;
    padding: .15rem;
    background-color: #fff;
    // 物料图片
    .matter_img {
      display: inline-block;
      width: .9rem;
      height: .9rem;
    }
    // 物料主体
    .mater_main {
      flex: 1;
      padding-left: .12rem;
      box-sizing: border-box;
      display: inline-block;
      // 物料名称
      .mater_name {
        line-height: .2rem;
        max-height: .46rem;
        overflow: hidden;
        font-size: .12rem;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        text-overflow: ellipsis;
        -webkit-box-orient: vertical;
      }
      // 物料信息
      .matter_info {
        /*word-break: break-all;*/
        display: flex;
        flex-wrap: wrap;
        line-height: .12rem;
        font-size: .12rem;
      }
      .matter_info_item {
        margin: .08rem .08rem 0 0;
      }
      .matter_info_title {
        color: #999;
      }
      .matter_info_value {
        flex: 1;
      }
    }
  }

  /* 编辑部分 */
  .matter-edit-part {
    margin-top: .1rem;
    color: #333;
    .picker {
      padding: .18rem .15rem;
    }
    /deep/ .weui-cells {
      margin-top: 0;
      overflow: visible;
      .vux-cell-box {
        &:after {
          border-color: #e8e8e8;
        }
      }
      .weui-cell {
        padding: .15rem;
        line-height: .2rem;
        font-size: .14rem;
        &:after {
          border-color: #e8e8e8;
        }
        .weui-cell__hd {
          display: flex;
          align-items: center;
          color: #696969;
        }
      }
      &:before {
        display: none;
      }
      &:after {
        display: none;
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
    &.btn_hide {
      display: none;
    }
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
  .dialog-view {
    .dialog-box {
      height:480px;
      overflow:scroll;
      -webkit-overflow-scrolling:touch;
    }
    .tip-top {
      padding: .1rem 0;
      line-height: .2rem;
      .header_cotent {
        font-size: .18rem;
        font-weight: bold;
      }
      .header_btn_tips {
        color: #757575;
        font-size: .12rem;
      }
    }
    .tip-main {
      width: 100%;
      text-align: left;
      padding: .1rem .15rem;
      margin-bottom: .15rem;
      box-sizing: border-box;
      box-shadow: 0 2px 10px 0 rgba(232, 232, 232, 0.7);
      .serial-part {
        width: 100%;
        font-size: .14rem;
        font-weight: bold;
        box-sizing: border-box;
      }
      .each-info-part {
        .package_num {
          color: #454545;
          font-size: .14rem;
        }
        .order_num {
          color: #757575;
          font-size: .12rem;
        }
      }
    }
    .other-info-part {
      width: 100%;
      color: #696969;
      padding: 0 .1rem;
      font-size: .12rem;
      text-align: initial;
      margin: .2rem 0 .1rem;
      box-sizing: border-box;
      .other_tips {
        .inside_tips {
          color: #757575;
          text-decoration: underline;
        }
      }
    }
    .btn-part {
      color: #FFF;
      padding: .1rem 0;
      font-weight: bold;
      background: #3296FA;
    }
  }
</style>

