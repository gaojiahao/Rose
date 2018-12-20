<template>
  <div v-transfer-dom>
    <popup v-model="show" height="80%" @on-show="onShow" @on-hide="onHide">
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
            <slot name='materUnit'></slot>
            <!-- 设施 -->
            <template v-if="modifyMatter.facilityName">
              <!-- 物料属性和单位 -->
              <div class="mater_more">
                <span class="processing">类型: {{modifyMatter.facilityType}}</span>
                <span>大类: {{modifyMatter.facilityBigType || "无"}}</span>
                <span>子类: {{modifyMatter.facilitySubclass || "无"}}</span>
                <span class='unit'>单位: {{modifyMatter.facilityUnit}}</span>
              </div>
              <div class="mater_more">
                <slot name="qtyBal" :modifyMatter="modifyMatter"></slot>
              </div>
            </template>
            <template v-else>
              <div class="mater_more">
                <slot name="qtyBal" :modifyMatter="modifyMatter">
                  <div>
                    <span class="processing">属性: {{modifyMatter.processing || "无"}}</span>
                    <span class='unit'>单位: {{modifyMatter.measureUnit}}</span>
                    <span class='mater_color'>颜色: {{modifyMatter.inventoryColor || "无"}}</span>
                  </div>
                  <div>
                    <span>大类: {{modifyMatter.inventoryTypen || "无"}}</span>
                    <span>子类: {{modifyMatter.inventorySubclass || "无"}}</span>
                    <span v-show="modifyMatter.qtyBal">余额: {{modifyMatter.qtyBal}}</span>
                  </div>
                </slot>
              </div>
            </template>
          </div>
        </div>
        <!-- 基本信息插槽 -->
        <slot name="modify" :modifyMatter="modifyMatter">

          <group class='mg_auto'>
            <x-input title="数量" type="number"  v-model.number='modifyMatter.tdQty' text-align="right"
              placeholder="请输入" @on-blur="checkAmt(modifyMatter)" @on-focus="getFocus($event)">
              <template slot="label">
                <slot name="qtyName">
                  <span class='required'>数量</span>
                </slot>
              </template>
            </x-input>
            <cell disabled title="包装数量" :value="modifyMatter.assistQty"></cell>
          </group>

          <group class="mg_auto">
            <x-input type="number"  v-model.number='modifyMatter.price' text-align="right"
            @on-blur="checkAmt(modifyMatter)" placeholder="请输入" @on-focus="getFocus($event)">
              <template slot="label">
                <span class='required'>含税单价
                </span>
              </template>
            </x-input>
            <x-input title="税率" type="number"  v-model.number='modifyMatter.taxRate' text-align="right"
              @on-blur="checkAmt(modifyMatter)" placeholder="请输入" @on-focus="getFocus($event)">
              <template slot="label">
                <span class='required'>税率
                </span>
              </template>
            </x-input>
            <cell disabled title="不含税单价" :value="`￥${numberComma(modifyMatter.noTaxPrice)}`"></cell>
          </group>
        </slot>
        <!-- 日期插槽 -->
        <group class="mg_auto">
          <slot name="date" :modifyMatter="modifyMatter"></slot>
        </group>
        <!-- 价格合计部分 -->
        <group class="mg_auto" v-if="isShowAmount">
          <cell disabled title="税金" :value="`￥${numberComma(modifyMatter.taxAmount)}`"></cell> 
          <cell disabled title="不含税金额" :value="`￥${numberComma(modifyMatter.noTaxAmount)}`"></cell>
          <!-- 该插槽用于替换价税小计的title-->    
          <cell disabled title="价税小计" :value="`￥${numberComma(modifyMatter.tdAmount)}`">
            <template slot="title">
              <slot name="tdAmountTitle">
                <span>价税小计</span>
              </slot>
            </template>
          </cell>
        </group>
       
      </div>
      <div class='confirm_btn' :class="{btn_hide : btnIsHide}" @click="confirm">
        <div class='confirm'>确认</div>
      </div>
    </popup>
  </div>
</template>

<script>
// vux组件引入
import { Cell, Group, Popup, XInput, Datetime, numberComma } from 'vux'
//组件引入
import { toFixed } from '@/plugins/calc'
import { accMul } from '@/home/pages/maps/decimalsAdd'
export default {
  name: 'MatterPop',
  filters: { 
    numberComma,
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
        return [
          {
            key: 'tdQty',
            message: '请填写数量'
          },
          {
            key: 'price',
            message: '请填写含税单价'
          },
          {
            key: 'taxRate',
            message: '请填写税率'
          },
        ]
      }
    }
  },
  components: {
    Cell, Group, Popup, XInput, Datetime
  },
  watch: {
    showPop: {
      handler(val) {
        this.show = val;
      }
    }
  },
  data(){
    return{
      show: false
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
      this.validateMap.every(item => {
        if (!this.modifyMatter[item.key]) {
          warn = item.message;
          return false
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
      let url = require('assets/wl_default02.png');
      if (item) {
        item.inventoryPic = url;
      }
      return url
    },
    // TODO 检查金额，取正数、保留两位小数
    checkAmt(item){
      let {price, tdQty, taxRate, qtyBal, qtyStockBal,qtyStock} = item;
      // 金额
      if (price) {
        item.price = Math.abs(toFixed(price));
      }
      // 数量
      if (tdQty && this.isCheckStock) {
        item.tdQty = Math.abs(toFixed(tdQty));
        // qtyStockBal为销售出库的库存，数量不允许大于余额
        if (!qtyStockBal && !qtyStock && qtyBal && tdQty > qtyBal) {
          item.tdQty = qtyBal;
        } else if (qtyStockBal && tdQty > qtyStockBal) { // 数量不允许大于库存
          item.tdQty = qtyStockBal;
        }
        //qtyStock为物料领料，数量不允许大于库存
        else if(qtyStock && tdQty > qtyStock){
          console.log(qtyStock);
          item.tdQty = qtyStock;
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
          margin-right: 0.04rem;
          .mater_color{
            margin-right: 0;
          }
        }

      }
    }

  }
</style>

