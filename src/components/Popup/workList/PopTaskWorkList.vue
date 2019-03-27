<template>
  <!-- 物料popup -->
 <div v-transfer-dom>
    <popup v-model="showPop" height="100%" class="trade_pop_part" @on-show="onShow" @on-hide="onHide">
      <div class="trade_pop">
        <m-search :filterList="filterList" @search='searchList' @turn-off="onHide" :isFill='true'></m-search>
        <!-- 费用列表 -->
        <r-scroll class="mater_list" :options="scrollOptions" ref="bScroll">
           <div class="each-work box_sd"  v-for='(item, index) in taskWorkList' :key='index'  v-if="item.qtyBalance>0"
               @click.stop="selThis(item, index)">
            <div class="work-main">
              <div class="order-code">
                <span class="order-title" v-show="workType === '启动'">派工单号</span>
                <span class="order-title" v-show="workType === '验收'">启动单号</span>
                <span class="order-num">{{item.transCode}}</span>
              </div>
              <div class="work_mid">
                <div class="product_name">
                  {{item.inventoryName}}<span class="symbol">[{{item.invProcessing}}]</span>
                </div>
              </div>
              <div class="work_mid">
                <div class="product_unit">
                  <span class="each_unit">加工订单号: {{item.processCode}}</span>
                  <span class="each_unit">工序: {{item.procedureName}}</span>
                </div>
                <div class="product_unit">
                  <span class="each_unit">总数: {{item.drQty}}</span>
                  <span class="each_unit">已{{workType}}: {{item.crQty}}</span>
                  <span class="each_unit">可{{workType}}: {{item.qtyBalance}}</span>
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
import { getObjFacility, getWorkOrderTask , getTaskWorkList } from 'service/Product/gdService'
import RScroll from 'plugins/scroll/RScroll'
import MSearch from 'components/search/search'
import {accAdd} from 'plugins/calc/decimalsAdd'
  export default {
    name: "work-list-pop",
    props: {
      show: {
        type: Boolean,
        default: false
      },
      params: {
        type: Object,
        default(){
          return {
            calc_rel_code: 7051,
            view_id: 'view_94',
          }
        }
      },
      workType: {
        type: String,
        default: '派工'

      }
    },
    components: {
      Icon, Popup, LoadMore, RScroll, MSearch
    },
    data() {
      return {
        showPop: false,
        srhInpTx: '', // 搜索框内容
        selItems: [], // 哪些被选中了
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
          },
          {
            name: '派工单号',
            value: 'transCode'
          },

        ],
        filterProperty: '',
        taskWorkList: {},
      }
    },
    watch: {
      show: {
        handler(val) {
          this.showPop = val;
        }
      },
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
        // this.selItems = []
      },
      // 判断是否展示选中图标
      showSelIcon(sItem) {
        let flag = false;
        this.selItems && this.selItems.every(item => {
          if (item.orderCode && sItem.matCode === item.matCode && sItem.transCode === item.transCode && sItem.orderCode === item.orderCode) {
            flag = true;
            return false;
          }
          else if (!item.orderCode && sItem.matCode === item.matCode && sItem.transCode === item.transCode) {
            flag = true;
            return false;
          }
          return true;
        });
        if (flag){
          this.btnText = `发起工单${this.workType}`
        }
        return flag;
      },
      // 选择物料
      selThis(sItem, sIndex) {
        let arr = this.selItems;
        let delIndex = arr.findIndex(item => item.transCode === sItem.transCode && item.matCode === sItem.matCode);
        // 工单任务验收选中的检验
        if (sItem.orderCode){
          delIndex = arr.findIndex(item => item.transCode === sItem.transCode && item.matCode === sItem.matCode && item.orderCode === sItem.orderCode);
        }
        // 若存在重复的 则清除
        if (delIndex !== -1) {
          arr.splice(delIndex, 1);
          if (!arr.length){
             this.btnText = '关闭'
          }
          return;
        }
        this.selItems = [sItem];
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
        return getTaskWorkList({
          ...this.params,
          filter: JSON.stringify(filter),
        }).then(({data = []}) => {
          this.taskWorkList = data;
        });
      },
      // 搜索物料
      searchList({val = '', property = ''}) {
        this.srhInpTx = val;
        this.filterProperty = property;
        this.taskWorkList = {};
        this.$refs.bScroll.scrollTo(0, 0);
        this.getWorkOrderTask();
      },
      btnHandle(){
        if (this.btnText !== '关闭'){
          this.$emit('sel-task',this.selItems)          
        }
        this.showPop = false;
      }
    },
    created() {
      this.getWorkOrderTask();
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
        // 搜索
        .search_part {
          width: 100%;
          display: flex;
          height: .3rem;
          line-height: .3rem;
          position: relative;
          // 搜索输入框
          .srh_inp {
            flex: 5;
            outline: none;
            border: none;
            color: #2D2D2D;
            font-size: .16rem;
            padding: 0 .3rem 0 .4rem;
            background: #F3F1F2;
            border-top-left-radius: .3rem;
            border-bottom-left-radius: .3rem;
          }
          // 取消 按钮
          .pop_cancel {
            flex: 1;
            color: #fff;
            font-size: .14rem;
            text-align: center;
            background: #fc3c3c;
            border-top-right-radius: .3rem;
            border-bottom-right-radius: .3rem;
          }
          // 搜索icon
          .serach_icon {
            top: 50%;
            left: 10px;
            fill: #2D2D2D;
            position: absolute;
            transform: translate(0, -50%);
          }
          // 清除icon
          .clear_icon {
            top: 50%;
            right: 14%;
            width: .3rem;
            height: .3rem;
            z-index: 100;
            display: block;
            font-size: .12rem;
            line-height: .3rem;
            text-align: center;
            position: absolute;
            transform: translate(0, -50%);
          }
        }
        // 关闭icon
        .close_icon {
          top: 50%;
          right: -2%;
          position: absolute;
          transform: translate(0, -50%);
        }
      }
      .each_mode {
        margin-right: .1rem;
        display: inline-block;
        padding: .04rem .2rem;
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
          .order_list{
            padding-left: .24rem;
            border-top: 1px dashed #e8e8e8;
            .each_order{
              padding: 0.05rem 0;
              list-style: initial;
              .order{
                font-size: .14rem;
                padding: .02rem 0;
                font-weight: bold;
              }
              // .work_code,.code_name{
              //   color: #111;
              //   background: #fff;
              // }
            }
          }
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
