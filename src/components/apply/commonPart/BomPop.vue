<template>
  <div v-transfer-dom>
    <popup v-model="showPop" height="80%" class="trade_pop_part" @on-show="onShow" @on-hide="onHide">
      <div class="trade_pop">
        <r-scroll class="mater_list" :options="scrollOptions" ref="bScroll">
          <div class="each_bom" v-for="(item,index) in bomInfo.boms" :ikey="index" v-if="bomInfo.boms">
            <group class='mg_auto' label-width="4em">
              <cell title="原料名称" v-model="item.inventoryName" text-align="right"></cell>
              <cell title="原料编码" v-model="item.inventoryCode" text-align="right"></cell>
              <cell title="领料需求" v-model="item.tdQty" text-align="right"></cell>
              <x-input title="损耗率" type="number" v-model.number="item.specificLoss" text-align="right" @on-blur="modifyBom(item)"></x-input>
            </group>
          </div>
        </r-scroll>
      </div>
      <!-- 底部栏 -->
      <div class='confirm_btn' :class="{btn_hide : btnIsHide}" @click="confirm">
        <div class='confirm'>确认</div>
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
  },
  data(){
    return{
      scrollOptions: { // 滚动配置
        click: true,
      },
      showPop :false
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
    },
    // TODO 弹窗隐藏时调用
    onHide() {
      this.$emit('input', false);
    },
    //确认修改
    confirm(){
      this.$emit('bom-confirm',JSON.stringify(this.bomInfo))
      this.showPop = false;
    },
    modifyBom(item){
      item.specificLoss = Math.abs(toFixed(item.specificLoss));
      item.tdQty = accMul(this.bomInfo.tdQty, item.qty, (1 + item.specificLoss));

    }
  }

}
</script>

<style scoped lang="scss">
.trade_pop_part {
    background: #f8f8f8;
    .trade_pop {
      padding: 0 .08rem;
      height: calc(100% - .44rem);
      .mater_list {
        width: 100%;
        overflow: hidden;
        box-sizing: border-box;
        height: calc(100% - .38rem);
        //重置vux样式
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
        .each_bom{
          background: #fff;
          margin-bottom: 0.1rem;
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
    .btn_hide{
      display: none;
    }
}

</style>
