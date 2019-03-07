<template>
  <!-- 物料popup -->
  <div v-transfer-dom>
    <popup v-model="showPop" height="100%" class="trade_pop_part" @on-show="onShow" @on-hide="onHide">
      <div class="trade_pop">
        <m-search :filterList="filterList" @search='searchList' @turn-off="onHide" :isFill='true'></m-search>
        <!-- 费用列表 -->
        <r-scroll class="mater_list" :options="scrollOptions" ref="bScroll">
           <div class="each-work box_sd"  v-for='(item, index) in taskWorkList' :key='index'
               @click.stop="selThis(item, index)">
            <div class="work-main">
              <div class="work_mid">
                <div class="order-code" v-show="workType === '验收'">
                  <span class="order-title" >启动单号</span>
                  <span class="order-num">{{item.transCode}}</span>
                </div>
                <div class="product_name">
                  {{item.inventoryName}}
                  <!-- <span class="symbol">[{{item.invProcessing}}]</span> -->
                </div>
              </div>
              <div class="work_mid">
                <div class="product_unit" v-show="item.orderCode">
                  <span class="each_unit">工单派工号: {{item.orderCode}}</span>
                </div>
                <div class="product_unit">
                  <span class="each_unit" v-show="item.processCode || item.transCode">加工订单号: {{workType === '验收'? item.processCode : item.transCode}}</span>
                  <span class="each_unit">工序: {{item.procedureName}}</span>
                </div>
                <div class="product_unit">
                  <span class="each_unit">{{workType}}总数: {{item.productDemandQty}}</span>
                  <span class="each_unit">已{{workType}}: {{item.thenLockQty}}</span>
                  <span class="each_unit">可{{workType}}: {{item.thenQtyBal || item.qtyBal}}</span>
                </div>
              </div>
            </div>
            <!-- icon -->
            <x-icon class="selIcon" type="ios-circle-outline" size="20" ></x-icon>
            <x-icon class="isSelIcon" type="ios-checkmark" size="20" v-show="showSelIcon(item)"></x-icon>
          </div>
        </r-scroll>
        <div class="btn vux-1px-t">
          <div class="cfm_btn" @click="btnHandle">{{btnText}}</div>
        </div>
      </div>
    </popup>
  </div>
</template>

<script>
import { Icon, Popup, LoadMore } from 'vux'
import { getObjFacility, getWorkOrderTask , getWorkStartList, getWorkCheckList } from 'service/Product/gdService'
import RScroll from 'components/RScroll'
import MSearch from 'components/search'
import {accAdd} from '@/home/pages/maps/decimalsAdd'
  export default {
    name: "work-list-pop",
    props: {
      show: {
        type: Boolean,
        default: false
      },
      workType: {
        type: String,
        default: '派工'
      },
      getListMethod: {
        type: String,
        default: 'getWorkOrderTask'
      },
    },
    components: {
      Icon, Popup, LoadMore, RScroll, MSearch
    },
    data() {
      return {
        showPop: false,
        srhInpTx: '', // 搜索框内容
        scrollOptions: {
          click: true,
        },
        btnText : '关闭',
        filterList:[
          {
            name: '物料名称',
            value: 'inventoryName',
          },
          {
            name: '工序名称',
            value: 'procedureName'
          }    
        ],
        filterProperty: '',
        taskWorkList: [],
        tmpItems: [],
        requestMethods: null,
      }
    },
    watch: {
      show: {
        handler(val) {
          this.showPop = val;
        }
      },
      workType: {
        handler(val){
          if (val === '验收'){
            this.filterList.push({
              name: '启动单号',
              value: 'transCode'
            })
          }
          else if (val === '派工'){
            this.filterList.push({
              name: '加工订单号',
              value: 'transCode'
            })
          }
        },
        immediate: true
      }
    },
    methods: {
      // 弹窗展示时调用
      onShow() {
        this.$nextTick(() => {
          if (this.$refs.bScroll) {
            this.$refs.bScroll.refresh();
          }
        })
      },
      // 弹窗隐藏时调用
      onHide() {
        this.$emit('input', false);
        this.tmpItems = [];
      },
      // 匹配相同项的索引
      findIndex(arr, sItem) {
        return arr.findIndex(item => {
          return item.colId === sItem.colId
        });
      },
      showSelIcon(sItem) {
        let flag = this.findIndex(this.tmpItems, sItem);
        return flag !== -1;
      },
      // 选择物料
      selThis(sItem, sIndex) {
        let arr = this.tmpItems;
        let delIndex = this.findIndex(arr, sItem);
        // 若存在重复的 则清除
        if (delIndex !== -1) {
          arr.splice(delIndex, 1);
          if (!arr.length){
             this.btnText = '关闭'
          }
          return;
        }
        if (this.workType !== '派工'){
          this.tmpItems = [sItem]
        }
        else {
          arr.push(sItem);
        }
        this.btnText = this.tmpItems? `发起工单${this.workType}`: '关闭';
      },
      // 获取物料列表
      getWorkOrderTask() {
        let filter = [];
        if (this.srhInpTx) {
          filter = [
            ...filter,
            {
              operator: 'like',
              value: this.srhInpTx,
              property: this.filterProperty
            },
          ];
        }
        return getWorkOrderTask({
          filter: JSON.stringify(filter),
        }).then(({tableContent = []}) => {
          tableContent.forEach(item => {
            item.isStartTask = false;
          })
          this.taskWorkList = tableContent
        });
      },
      // 获取物料列表
      getWorkCheckList() {
        let filter = [];
        if (this.srhInpTx) {
          filter = [
            ...filter,
            {
              operator: 'like',
              value: this.srhInpTx,
              property: this.filterProperty
            },
          ];
        }
        return getWorkCheckList({
          filter: JSON.stringify(filter),
        }).then(({tableContent = []}) => {
          tableContent.forEach(item => {
            item.isStartTask = false;
          })
          this.taskWorkList = tableContent
        });
      },
       // 获取物料列表
      getWorkStartList() {
        let filter = [];
        if (this.srhInpTx) {
          filter = [
            ...filter,
            {
              operator: 'like',
              value: this.srhInpTx,
              property: this.filterProperty
            },
          ];
        }
        return getWorkStartList({
          filter: JSON.stringify(filter),
        }).then(({tableContent = []}) => {
          tableContent.forEach(item => {
            item.isStartTask = false;
          })
          this.taskWorkList = tableContent
        });
      },
      // 搜索物料
      searchList({val = '', property = ''}) {
        this.srhInpTx = val;
        this.filterProperty = property;
        this.taskWorkList = {};
        this.$refs.bScroll.scrollTo(0, 0);
        this.requestMethods();
      },
      btnHandle(){
        if (this.btnText !== '关闭'){
          this.$emit('sel-task',this.tmpItems)          
        }
        this.showPop = false;
      }
    },
    created() {
      this.requestMethods = this[this.getListMethod];
      this.requestMethods();
    }
  }
</script>

<style scoped lang="scss">
  .vux-1px-b:after {
    border-color: #e8e8e8;
  }
  .symbol {
    font-size: .1rem;
  }
  // 弹出层
  .trade_pop_part {
    background: #fff;
    .trade_pop {
      
      height: 100%;
      position: relative;
      // 顶部
      .title {
        height: 100%;
        font-size: .2rem;
        position: relative;
        padding-top: 0.08rem;
      }
      .vux-1px:before {
        border-radius: 40px;
      }
      // 物料列表
      .mater_list {
        width: 100%;
        overflow: hidden;
        box-sizing: border-box;
        height: calc(100% - .5rem - .66rem);
        /* 使用深度作用选择器进行样式覆盖 */
        /deep/ .scroll-wrapper {
          padding: .14rem .04rem 0 .3rem;
        }
        // 每个物料
        .each-work {
          padding: 0 .08rem;
          position: relative;
          margin-bottom: .2rem;
          box-sizing: border-box;
          .work_top {
            font-size: 0;
            .code_name,
            .work_code {
              color: #FFF;
              font-size: .12rem;
              padding: .02rem .04rem;
            }
            .code_name {
              background: #455d7a;
            }
            .work_code {
              background: #c93d1b
            }
          }
          .order-code{
            display: flex;
            color: #fff;
            font-size: .12rem;
            .order-title{
              padding: 0 .04rem;
              background: #455d7a;
              display: inline-block;
            }
            .order-num{
              background: #c93d1b;
              border-top-right-radius: .08rem;
              padding: 0 .04rem;
            }
          }
          .work_mid {
            font-size: 0;
            padding: .04rem 0;
            position: relative;
            .product_name {
              color: #111;
              font-size: .18rem;
              font-weight: bold;
            }
            .product_unit {
              .each_unit {
                color: #252525;
                font-size: .12rem;
                margin-right: .06rem;
              }
            }
            .arrow{
              width:0.3rem;
              height: 100%;;
              position: absolute;
              right: -.08rem;
              top: 0;
              text-align: center;
              /* 倒三角 */
              .vux-x-icon-ios-arrow-down {
                margin-top:0.2rem;
                transition: transform 200ms linear;
                &.arrow-up {
                  transform: rotate(-180deg);
                }
              }
            }
          }
          .work_btm {
            font-size: 0;
            padding-top: .02rem;
            .procedure_name {
              font-size: .16rem;
              font-weight: bold;
            }
            .procedure_unit {
              color: #757575;
              font-size: .12rem;
              .each_unit {
                margin-right: .04rem;
              }
            }
          }
          // 阴影
          &.box_sd {
            box-sizing: border-box;
            box-shadow: 0 0 8px #e8e8e8;
          }
          // 选择icon
          .selIcon,
          .isSelIcon {
            top: 50%;
            left: -.3rem;
            position: absolute;
            transform: translate(0, -50%);
          }
          .isSelIcon {
            fill: #5077aa;
          }
          .order{
            font-size: .14rem;
            padding: .02rem 0;
            font-weight: bold;
          }
          // .order_list{
          //   padding-left: .24rem;
          //   border-top: 1px dashed #e8e8e8;
          //   .each_order{
          //     padding: 0.05rem 0;
          //     list-style: initial;
          //     .order{
          //       font-size: .14rem;
          //       padding: .02rem 0;
          //       font-weight: bold;
          //     }
          //     // .work_code,.code_name{
          //     //   color: #111;
          //     //   background: #fff;
          //     // }
          //   }
          // }
        }
      }
      //关闭按钮
      .btn{
        left: 0;
        bottom: 0;
        width: 100%;
        box-sizing: border-box;
        background: #fff;
        text-align: center;
        padding: .1rem 0;
        .cfm_btn{
          width: 2.8rem;
          color: #fff;
          height: .44rem;
          line-height: .44rem;
          text-align: center;
          background: #5077aa;
          display: inline-block;
          border-radius: .4rem;
          box-shadow: 0 2px 5px #5077aa;
        }
      }
      

    }
  }
</style>
