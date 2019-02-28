<template>
  <div v-transfer-dom>
    <popup v-model="showPop" height="80%" class="trade_pop_part" @on-show="onShow" @on-hide="onHide">
      <div class="trade_pop">
        <r-scroll class="mater_list" :options="scrollOptions" ref="bScroll">
          <div class="bom-container" v-if="bomInfo.boms && bomInfo.boms.length">
            <div class="title vux-1px-b">bom</div>
            <div class="each-bom-part vux-1px-b" v-for="(bom, bIndex) in bomInfo.boms" :key="bIndex">
              <div class="main-info-part">
                <div class="main-top" v-if="bom.warehouseName || bom.warehouseCode">
                  <span class="content-title" v-if="bom.warehouseName">{{bom.warehouseName}}</span>
                  <span class="side-bar vux-1px-r" v-if="bom.warehouseName"></span>
                  <span class="content-info" v-if="bom.warehouseCode">{{bom.warehouseCode}}</span>
                </div>
                <div class="main-content">
                  <div class="content-unit">
                    <span class="iconfont icon-bianma"></span>
                    <span>物料编码: {{bom.inventoryCode}}</span>
                  </div>
                  <div class="content-name">
                    {{bom.inventoryName}}
                  </div>
                </div>
                <slot :bom="bom" name="bom-left"></slot>
              </div>
              <div class="edit_info">
                <slot :bom="bom" name="number">
                  <div class="number-part">
                    <span class="main-number">本次扣料: {{bom.tdQty}}{{bom.measureUnit}}</span>
                    <span class="number-unit">可用余额: {{bom.qtyStock}}</span>
                  </div>
                </slot>
                <div class="specific_loss" @click="modifyBom(bom)" v-show="isEdit && !noSpecificLoss">{{specificLossText}}: {{bom.specificLoss}}<span class="iconfont icon-bianji1"></span></div>
              </div>
            </div>
          </div>
        </r-scroll>
      </div>
      <!-- 底部栏 -->
      <div class='confirm_btn' @click="confirm" v-if="isEdit">
        <div class='confirm'>{{btnNext}}</div>
      </div>
      <div class='confirm_btn' @click="closePop" v-else>
        <div class='confirm'>关闭</div>
      </div>
    </popup>
  </div>
</template>

<script>
// vux组件引入
import {Popup, TransferDom,Group,Cell,XInput,} from 'vux'
//组件引入
import RScroll from 'components/RScroll'
import {toFixed} from '@/plugins/calc'
// 公共方法
import {accMul} from '@/home/pages/maps/decimalsAdd'
export default {
  name:'Bom',
  props: {
    show: {
      type: Boolean,
      default: false
    },
    bomInfo:{
      type : Object,
      default (){
        return {}
      }
    },
    //底部按钮是否隐藏
    btnIsHide :{
      type : Boolean,
      default : false
    },
    //是否编辑损耗率
    isEdit : {
      type : Boolean,
      default : true
    },
    specificLossText:{
      type : String,
      default : '损耗率'
    },
    // 不展示损耗率
    noSpecificLoss: {
      type: Boolean,
      default: false
    }
  },
  data(){
    return{
      scrollOptions: { // 滚动配置
        click: true,
      },
      showPop :false,
      btnNext : '返回'
    }
  },
  components:{Popup,Group,Cell,XInput,RScroll},
  watch: {
      show: {
        handler(val) {
          this.showPop = val;
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
        }
      })
      this.btnNext = '返回'
    },
    // TODO 弹窗隐藏时调用
    onHide() {
      this.$emit('input', false);
    },
    //确认修改
    confirm(){
      if(this.btnNext === '确认'){
        this.$emit('bom-confirm',JSON.stringify(this.bomInfo))
      }
      this.showPop = false;
    },
    modifyBom(item){
      this.$vux.confirm.prompt(item.specificLoss, {
        title: this.specificLossText,
        onConfirm: (val)=> {
          if(val){
            item.specificLoss = Math.abs(toFixed(val));
            let tdQty = accMul(this.bomInfo.tdQty, item.qty, (1 + item.specificLoss));
            item.tdQty = Math.abs(toFixed(tdQty));
            this.btnNext = '确认'
          }
        }
      })
    },
    //输入框获取焦点，内容选中
    getFocus(e){
      event.currentTarget.select();
    },
    closePop(){
      this.showPop = false;
    },
    // TODO 修改按钮文案
    changeToConfirm() {
      this.btnNext = '确认';
    },
  }

}
</script>

<style scoped lang="scss">
.trade_pop_part {
    background: #f8f8f8;
    .trade_pop {
      height: calc(100% - .64rem);
      &.no_btn{
        height: calc(100% - 0.1rem);
      }
      .mater_list {
        width: 100%;
        overflow: hidden;
        box-sizing: border-box;
        height: calc(100% - .38rem);
        .bom-container {
          width: 100%;
          background: #fff;
          .title {
            padding: .03rem 0;
            color: #111;
            font-weight: bold;
            font-size: .24rem;
            text-align: center;
          }
          .each-bom-part {
            width: 100%;
            display: flex;
            padding: .06rem 0.08rem;
            align-items: center;
            box-sizing: border-box;
            .main-info-part {
              flex: 2;
              .main-top {
                font-size: 0;
                display: flex;
                align-items: center;
                padding-bottom: .02rem;
                .content-title {
                  color: #005792;
                  font-size: .1rem;
                  font-weight: bold;
                }
                .side-bar {
                  height: .1rem;
                  margin: 0 .04rem;
                  display: inline-block;
                }
                .content-info {
                  @extend .content-title;
                }
              }
              .main-content {
                .content-unit {
                  color: #757575;
                  font-size: .1rem;
                  word-break: break-all;
                  .icon-bianma {
                    font-size: .1rem;
                  }
                }
                .content-name {
                  font-size: .12rem;
                  font-weight: bold;
                  word-break: break-all;
                }
              }
            }
            .edit_info{
              flex: 1;
              .number-part {
                display: flex;
                font-size: .1rem;
                text-align: right;
                flex-direction: column;
                .main-number {
                  font-size: .12rem;
                  font-weight: bold;
                }
                .number-unit {
                  color: #757575;
                }
              }
              .specific_loss{
                font-size: .12rem;
                font-weight: bold;
                text-align: right;
                .icon-bianji1{
                  font-size: 0.12rem;
                  font-weight: normal;
                }
              }

            }

          }
          .vux-1px-b:after {
            border-bottom: 1px solid #e8e8e8;
          }
        }
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
}

</style>
