<template>
  <div v-transfer-dom>
    <popup v-model="show" height="80%" @on-show="onShow" @on-hide="onHide">
      <div class='edit_matter'>
        <div class='matter_info mg_auto'>
          <img :src="modifyMatter.inventoryPic" alt="mater_img" @error="getDefaultImg(item)" class='mater_img'/>
          <div class='mater_main'>
            <div class="mater_name">
              {{modifyMatter.inventoryName}}
            </div>
            <!-- 物料基本信息 -->
            <div class="mater_info" style='width:2.6rem;'>
              <!-- 物料编码、规格 -->
              <div class="withColor">
                <!-- 物料编码 -->
                <div class="ForInline" style="display:inline-block">
                  <div class="mater_code">
                    <span class="title">编码</span>
                    <span class="num">{{modifyMatter.inventoryCode}}</span>
                  </div>
                </div>
                <!-- 物料规格 -->
                <div class="ForInline" style="display:inline-block">
                  <div class="mater_spec">
                    <span class="title">规格</span>
                    <span class="num">{{modifyMatter.specification || '无'}}</span>
                  </div>
                </div>
              </div>
            </div>
            <!-- 物料属性和单位 -->
            <div class="mater_more">
                <span class="processing">属性: {{modifyMatter.processing}}</span>
                <span class='unit'>单位: {{modifyMatter.measureUnit}}</span>
                <span class='mater_color'>颜色: {{modifyMatter.inventoryColor || '无'}}</span>
            </div>
            <div class="mater_more">
                <span>大类: {{modifyMatter.inventoryType}}</span>
                <span>子类: {{modifyMatter.inventorySubclass}}</span>
            </div>
            <div class="mater_more">
              <!--物料库存-->
              <slot name="materStock" :modifyMatter="modifyMatter">
                  <span v-show="modifyMatter.qtyBal">余额: {{modifyMatter.qtyBal}}</span>
              </slot>
            </div>
          </div>
        </div>
        <group class='mg_auto'>
          <slot name="modify" :modifyMatter="modifyMatter">
            <x-input title="数量" type="number"  v-model.number='modifyMatter.tdQty' text-align="right"
              placeholder="请输入" @on-blur="checkAmt(modifyMatter)" @on-focus="getFocus($event)">
            </x-input>
            <x-input title="单价" type="number"  v-model.number='modifyMatter.price' text-align="right"
            @on-blur="checkAmt(modifyMatter)" placeholder="请输入" @on-focus="getFocus($event)"></x-input>
            <x-input title="税率" type="number"  v-model.number='modifyMatter.taxRate' text-align="right"
              @on-blur="checkAmt(modifyMatter)" placeholder="请输入" @on-focus="getFocus($event)">
            </x-input>
            <datetime title="预期交货日" v-model="modifyMatter.promDeliTime"
                      placeholder="请选择" ></datetime>
          </slot>
        </group>
        <div class='mg_auto' v-show="isShowAmount">
          <div class='each_info vux-1px-b'>
            <slot name="modifyTitle">
              <label>金额</label>
            </slot>
            <div class='matter_val'>￥{{modifyMatter.noTaxAmount}}</div>
          </div>
          <div class='each_info vux-1px-b'>
            <label>税金</label>
            <div class='matter_val'>￥{{modifyMatter.taxAmount}}</div>
          </div>
          <div class='each_info'>
            <label>价税小计</label>
            <div class='matter_val'>￥{{modifyMatter.tdAmount}}</div>
          </div>
        </div>
      </div>
      <div class='confirm_btn' :class="{btn_hide : btnIsHide}" @click="confirm">
        <div class='confirm'>确认</div>
      </div>
    </popup>
  </div>
</template>

<script>
// vux组件引入
import {Popup, TransferDom,Group,Cell,Datetime,XInput,PopupPicker } from 'vux'
//组件引入
import {toFixed} from '@/plugins/calc'
export default {
  props:{
    modifyMatter:{
      type:Object,
      default() {
          return {}
        }
    },
    showPop:{
      type:Boolean,
      default : false
    },
    //底部按钮是否隐藏
    btnIsHide :{
      type : Boolean,
      default : false
    },
    //校验数量是否大于库存
    isCheckStock :{
      type : Boolean,
      default : true
    },
    //是否展示金额，税金，价税小计
    isShowAmount : {
      type : Boolean,
      default :true
    }
  },
  components: {
      Popup,Group,Cell,Datetime,XInput,
    },
  data(){
    return{
      show: false
    }
  },
  watch:{
    showPop: {
      handler(val) {
        this.show = val;
      }
    },
  },
  methods:{
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

  },

}
</script>

<style lang="scss" scoped>
  .vux-1px-b:after,.vux-1px-t:before{
    border-color: #e8e8e8;
  }
  .vux-popup-dialog{
    background: #F8F8F8;

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
        span{
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

