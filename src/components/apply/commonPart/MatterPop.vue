<template>
  <div v-transfer-dom>
    <popup v-model="show" height="80%" @on-show="onShow" @on-hide="onHide">
      <r-scroll class="mater_list" :options="scrollOptions" ref="bScroll">
        <div class='edit_matter'>
          <div class='matter_info mg_auto'>
            <img :src="modifyMatter.inventoryPic" alt="mater_img" @error="getDefaultImg(item)" class='mater_img'/>
            <div class='mater_main'>
              <div class="mater_name">
                {{modifyMatter.inventoryName || modifyMatter.facilityName || modifyMatter.inventoryName_outPutMatCode}}
              </div>
              <!-- 物料基本信息 -->
              <div class="mater_info" style='width:2.6rem;'>
                <!-- 物料编码、规格 -->
                <div class="withColor">
                  <!-- 物料编码 -->
                  <div class="ForInline" style="display:inline-block">
                    <div class="mater_code">
                      <span class="title">编码</span>
                      <span class="num">{{modifyMatter.inventoryCode || modifyMatter.facilityCode || modifyMatter.outPutMatCode}}</span>
                    </div>
                  </div>
                  <!-- 物料规格 -->
                  <div class="ForInline" style="display:inline-block">
                    <div class="mater_spec">
                      <span class="title">规格</span>
                      <span class="num">{{modifyMatter.specification || modifyMatter.facilitySpecification || modifyMatter.specification_outPutMatCode ||'无'}}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div class="mater_more">
                <span v-for="(item, index) in config.property" :key="index">
                  {{item.text}}: 
                  <span v-if="item.showFieldCode">
                    {{modifyMatter[item.showFieldCode] != null && modifyMatter[item.showFieldCode] !== ""  ?  modifyMatter[item.showFieldCode] : "无"}}
                  </span>
                  <span v-else>
                   {{modifyMatter[item.fieldCode] != null && modifyMatter[item.fieldCode] !== ""  ?  modifyMatter[item.fieldCode] : "无"}}
                  </span> 
                </span>
              </div>
            </div>
          </div>
          <group class="mg_auto">
            <div v-for="(eItem,eIndex) in config.editPart" :key="eIndex">
              <template v-if="!eItem.readOnly">
                <!-- 数字输入框 -->
                <x-input class="vux-1px-b" type="number" v-model.number='modifyMatter[eItem.fieldCode]' text-align="right"
                        placeholder="请输入" v-if="(eItem.editorType === 'r2Numberfield' || eItem.editorType === 'r2Percentfield' || eItem.editorType === 'r2Permilfield') && eItem.fieldCode !=='tdQty'"
                        @on-blur="checkAmt(modifyMatter, eItem.fieldCode, modifyMatter[eItem.fieldCode])" 
                        @on-focus="getFocus($event)" >
                  <template slot="label">
                    <span :class="{required : !eItem.allowBlank}">{{eItem.text}}</span>
                  </template>
                </x-input>
                <!--文字输入框-->
                <x-input v-model='modifyMatter[eItem.fieldCode]' text-align="right" placeholder="请输入"
                          v-if="eItem.editorType === 'r2Textfield'">
                  <template slot="label">
                    <span :class="{required : !eItem.allowBlank}">{{eItem.text}}</span>
                  </template>
                </x-input>
                <!--处理销售订单订单数量会根据客户，物料，物料上线和下线，自动带出单价，税率-->
                <x-input class="vux-1px-b"  type="number"  v-model.number='modifyMatter[eItem.fieldCode]' text-align="right"
                        placeholder="请输入" v-if="eItem.fieldCode ==='tdQty'"
                        @on-blur="checkAmt(modifyMatter, eItem.fieldCode, modifyMatter[eItem.fieldCode])" 
                        @on-focus="getFocus($event)" >
                  <template slot="label">
                    <span :class="{required : !eItem.allowBlank}">{{eItem.text}}</span>
                    <span class="iconfont icon-tishi" v-show="modifyMatter.qtyDownline" @click="showDialog = !showDialog"></span>
                  </template>
                </x-input>
                <!--日期-->
                <datetime class="vux-1px-b" :start-date="modifyMatter[eItem.fieldCode]" :end-date="modifyMatter[eItem.fieldCode]"
                          v-model="modifyMatter[eItem.fieldCode]" placeholder="请选择" v-if="eItem.editorType === 'r2Datefield'">
                  <template slot="title">
                    <span :class="{required : !eItem.allowBlank}">{{eItem.text}}</span>
                  </template>
                </datetime>
                <!-- 下拉框 -->
                <popup-picker :data='eItem.remoteData' v-model="modifyMatter[eItem.fieldCode]" :popup-style="pickerStyle" 
                              placeholder="请选择" v-if="eItem.editorType === 'r2Combo'">
                  <template slot="title">
                    <span :class="{required : !eItem.allowBlank}">{{eItem.text}}
                    </span>
                  </template>
                </popup-picker>
              </template>
              <!--字段不可编辑-->
              <template v-else>
                <!--字段为数字时，显示千分符-->
                <cell class="vux-1px-b" disabled :title="eItem.text" :value="modifyMatter[eItem.fieldCode] || modifyMatter[eItem.showFieldCode] | checkNumber"
                      v-if="eItem.editorType === 'r2Numberfield'"></cell>
                <cell class="vux-1px-b" disabled :title="eItem.text" :value="modifyMatter[eItem.fieldCode] || modifyMatter[eItem.showFieldCode]" v-else></cell>
              </template> 
            </div> 
          </group>
        </div>
      </r-scroll>
      <div class='confirm_btn' :class="{btn_hide : btnIsHide}" @click="confirm">
        <div class='confirm'>确认</div>
      </div>
    </popup>
    <x-dialog class="dialog-view" v-if="modifyMatter.otherField" v-model="showDialog" hide-on-blur>
      <div class="tip-top">
        <p class="header_content">温馨提示</p>
        <p class="header_btn_tips">订单折合包装比：{{modifyMatter.assMeasureScale}}</p>
      </div>
      <div class="tip-main">
        <div class="each_info_part">
          <span class="package_num">订单数量上限：{{modifyMatter.qtyOnline * modifyMatter.assMeasureScale}}</span>
          <span class="order_num">[折合包装数量: {{modifyMatter.qtyOnline}}]</span>
        </div>
        <div class="each_info_part">
          <span class="package_num">订单数量下限：{{modifyMatter.qtyDownline * modifyMatter.assMeasureScale}}</span>
          <span class="order_num">[折合包装数量: {{modifyMatter.qtyDownline}}]</span>
        </div>
        <div class="other_info_part">
          <p class="other_tips">tips: 当您输入的订单数量在上述区间内，系统将会自动匹配<span class="inside_tips">销售协议{{modifyMatter.otherField.transCode}}</span>当中的价格，并自动计算其他属性。</p>
        </div>
        <div class="btn_part" @click="showDialog = !showDialog">我已阅读</div>
      </div>
    </x-dialog>
  </div>
</template>

<script>
// vux组件引入
import {  Cell, Group, Popup, XDialog,
          XInput, Datetime, PopupPicker, 
          numberComma, dateFormat} from 'vux'
//组件引入
import RScroll from 'components/RScroll'
import { toFixed } from '@/plugins/calc'
import { accAdd, accMul } from '@/home/pages/maps/decimalsAdd'
export default {
  name: 'MatterPop',
  filters: { 
    numberComma,
    checkNumber(val){
      if(val){
        return numberComma(val, 3)
      }
      return val
    }
  },
  props: {
    modifyMatter:{    // 进行修改的单个物料信息
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
    isCheckStock :{   // 校验数量是否大于库存
      type : Boolean,
      default : true
    },
    isShowAmount : {  // 是否展示金额，税金，价税小计
      type : Boolean,
      default :true
    },
    dateText:{
      type : String,
      default : '预期交货日'
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
    XInput, Datetime, RScroll, PopupPicker
  },
  watch: {
    showPop: {
      handler(val) {
        this.show = val;
      }
    },
    // 监听用于根据（生产日期+保质期天数）计算有效期
    modifyMatter: {
      handler(val) {
        let productionDate = new Date(val.productionDate).getTime(),
            day = 24 * 3600 * 1000;
        val.validUntil = productionDate ? dateFormat(productionDate + accMul(val.keepingDays, day), 'YYYY-MM-DD') : '';
      },
      deep: true
    }
  },
  data(){
    return{
      show: false,
      showDialog: false,
      scrollOptions: { // 滚动配置
        click: true,
      },
      pickerStyle: { zIndex: 550 },
    }
  },
  methods: {
    numberComma(val) {
      if (!val && val !== 0) {
        return '无';
      }
      return numberComma(val);
    },    
    // TODO 弹窗展示时调用
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
    // TODO 弹窗隐藏时调用
    onHide() {
      this.$emit('input', false);
      this.showPrice = false;
      this.currentType = '渠道价'
    },
    //确认修改
    confirm(){
      let warn = '';
      this.config.editPart.every(item => {
        if(!item.allowBlank){
          if((Array.isArray(this.modifyMatter[item.fieldCode]) && !this.modifyMatter[item.fieldCode].length) || !this.modifyMatter[item.fieldCode]){
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
      this.$emit('sel-confirm',JSON.stringify(this.modifyMatter))
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
    // TODO 检查金额，取正数、保留两位小数
    checkAmt(item, key, val){
      let {price, tdQty, taxRate, qtyBal, qtyStockBal,qtyStock, qtyBalance, qtyDownline, qtyOnline, assistQty} = item;
      item[key] = Math.abs(toFixed(val));
      // 数量
      if (key === 'tdQty' && tdQty && this.isCheckStock) {
        // item.tdQty = Math.abs(toFixed(tdQty));
        // qtyStockBal为销售出库的库存，数量不允许大于余额
        if (!qtyStockBal && !qtyStock && qtyBal && tdQty > qtyBal) {
          item.tdQty = qtyBal;
        } 
        else if (qtyStockBal && tdQty > qtyStockBal) { // 数量不允许大于库存
          item.tdQty = qtyStockBal;
        }
        //qtyStock为物料领料，数量不允许大于库存
        else if(qtyStock && tdQty > qtyStock){
          console.log(qtyStock);
          item.tdQty = qtyStock;
        }
        else if(qtyBalance && tdQty > qtyBalance){
          item.tdQty = qtyBalance;
        }
        else if(qtyOnline && qtyDownline){
          if(assistQty >= qtyDownline && assistQty <= qtyOnline){
            item.price = item.otherField.price;
            item.taxRate = item.otherField.taxRate;
            item.dealerInventoryName = item.otherField.dealerInventoryName;
            item.dealerInventoryCode = item.otherField.dealerInventoryCode;
          }
          else{
            item.price = '';
            item.taxRate = 0.16;
            item.dealerInventoryName = '';
            item.dealerInventoryCode = '';
          } 
        }
      }
      //税率
      if (taxRate) {
        item.taxRate = Math.abs(toFixed(taxRate));
      }
    },
    //输入框获取焦点时内容选中
    getFocus(e){
      event.currentTarget.select();
    }
  }
}
</script>

<style lang="scss" scoped>
  .vux-1px-b:after,.vux-1px-t:before{
    border-color: #e8e8e8;
  }
  .vux-popup-dialog{
    background: #F8F8F8;

  }
  .required{
    font-weight: bold;
    color: #5077aa;
  }
  .mater_list {
    width: 100%;
    overflow: hidden;
    box-sizing: border-box;
    height: calc(100% - .6rem);
  }
  .mg_auto{
    padding: 0 .08rem;
    width: 100%;
    box-sizing: border-box;
    background: #fff;
    margin-bottom: 0.06rem;
    .vux-no-group-title{
      margin-top:0;
    }
    /deep/ .weui-cells{
      margin-top:0;
      overflow: visible;
      .weui-cell{
        font-size: 0.14rem;
        .weui-cell__hd{
          display: flex;
          align-items: center;
        }
        &:before{
          left:0;
          border-color:#e8e8e8;
        }
      }
      &:before{
        border-top:none;

      }
      &:after{
        border-bottom:none;
      }
    }
  }
  .each_info{
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.1rem 0.15rem;
    font-size:0.14rem;
    label{
      color: #5077aa;
      font-weight: bold;
    }
    .matter_val{
      color:#999;
    }

  }
  //物料编辑的pop
  .edit_matter{
   position: relative;
    .pop_title{
      background: #fff;
      padding: 0.06rem 0;
      text-align: center;
      font-size:0.17rem;
    }
    .icon-tishi{
      margin: .02rem 0 0 .02rem;
    }
  }
  //确认按钮
  .confirm_btn{
    position: fixed;
    left:0;
    bottom:0;
    width:100%;
    box-sizing: border-box;
    background: #fff;
    padding: 0.1rem 0;
    .confirm{
      width:80%;
      border-radius: 0.2rem;
      background: #5077aa;
      height: 0.44rem;
      line-height: 0.44rem;
      text-align: center;
      color:#fff;
      margin:0 auto;
      box-shadow: 0 2px 5px #5077aa;
    }
  }
  .btn_hide{
    display: none;
  }
  //物料信息
  .matter_info{
    display: flex;
    padding: 0.1rem 0.15rem;
    // 物料图片
    .mater_img {
      width: .75rem;
      height: .75rem;
      display: inline-block;
      margin-top: .04rem;
      img {
        width: 100%;
        max-height: 100%;
      }
    }
    // 物料主体
    .mater_main {
      width: 2.6rem;
      margin-left: .1rem;
      display: inline-block;
      box-sizing: border-box;
      // 物料名称
      .mater_name {
        color: #111;
        font-size: .14rem;
        font-weight: bold;
        margin-bottom: .02rem;
      }
      // 物料信息
      .mater_info {
        color: #757575;
        font-size: .12rem;
        // 有颜色包裹的
        .withColor {
          // 物料编码
          .mater_code {
            display: flex;
            .title,
            .num {
              font-size: .1rem;
              padding: 0 .04rem;
              display: inline-block;
            }
            .title {
              color: #fff;
              background: #3f72af;

              border-top-left-radius: .12rem;
              border-bottom-left-radius: .12rem;
            }
            .num {
              color: #111;
              max-width: .9rem;
              overflow: hidden;
              white-space: nowrap;
              background: #dbe2ef;
              text-overflow: ellipsis;
              border-top-right-radius: .12rem;
              border-bottom-right-radius: .12rem;
            }
          }
          // 规格
          .mater_spec {
            @extend .mater_code;
            margin-left: .1rem;
            .title {
              color: #fff;
              background: #537791;

            }
            .num {
              color: #fff;
              max-width: .6rem;
              overflow: hidden;
              white-space: nowrap;
              background: #ff7f50;
              text-overflow: ellipsis;
            }
          }
        }
        // 没颜色包裹的
        .withoutColor {
          // 物料分类
          .mater_classify {
            font-size: .1rem;
            margin-top: .04rem;
          }
          // 物料颜色 材质
          .mater_material {
            font-size: .1rem;
            // margin-top: .1rem;
            .unit,
            .color {
              margin-right: .06rem;
            }
          }
        }
      }
      //物料单价，属性，颜色
      .mater_more{
        margin-top: .02rem;
        color: #757575;
        font-size: 0.1rem;
        span {
          display: inline-block;
          margin-right: .04rem;
          .mater_color{
            margin-right: 0;
          }
        }
        .unit {
          margin-right: .04rem;
        }
      }
    }

  }
  .dialog-view {
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
      .each_info_part {
        .package_num {
          color: #454545;
          font-size: .14rem;
        }
        .order_num {
          color: #757575;
          font-size: .1rem;
        }
      }
      .other_info_part {
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
      .btn_part {
        color: #FFF;
        padding: .1rem 0;
        font-weight: bold;
        background: #3f72af;
      }
    }
  }
</style>

