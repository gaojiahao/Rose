<template>
  <!-- 物料popup -->
  <div v-transfer-dom>
    <popup v-model="showPop" height="80%" class="trade_pop_part" @on-show="onShow" @on-hide="onHide">
      <div class="trade_pop">
        <m-search :filterList="filterList" @search='searchList' @turn-off="onHide"></m-search>
        <!-- 费用列表 -->
        <r-scroll class="mater_list" :options="scrollOptions" :has-next="hasNext"
                  :no-data="!hasNext && !workList.length" @on-pulling-up="onPullingUp"
                   ref="bScroll">
          <div class="each-work box_sd" v-for="(item, index) in workList" :key='index'
               @click.stop="selThis(item, index)">
            <div class="work-main">
              <div class="work_top" v-show="item.transCode">
                <span class="code_name">加工订单号</span>
                <span class="work_code">{{item.transCode}}</span>
              </div>
              <div class="work_mid vux-1px-b">
                <div class="product_name">
                  {{item.inventoryName}}<span class="symbol">[成品]</span>
                </div>
                <div class="product_unit">
                  <span class="each_unit">成品编码: {{item.inventoryCode}}</span>
                  <span class="each_unit" v-show="item.processProQty">加工数量: {{item.processProQty}}</span>
                </div>
              </div>
              <div class="work_btm">
                <div class="procedure_name">
                  <span>{{item.procedureName}}</span>
                  <span class="symbol">[工序编码: {{item.proPointCode}}]</span>
                </div>
                <div class="procedure_unit">
                  <!-- <span class="each_unit">工序待验收: {{item.thenQtyStock}}</span> -->
                  <span class="each_unit">工序可派工: {{item.thenQtyBal}}</span>
                  <span class="each_unit">派工总数: {{item.productDemandQty}}</span>
                  <!-- <span class="each_unit">已派工数: {{item.thenLockQty}}</span> -->
                </div>
              </div>
              <div>
                <!-- dateFormat('YYYY-MM-DD') -->
              </div>

            </div>
            <!-- icon -->
            <x-icon class="isSelIcon" type="ios-checkmark" size="20" v-show="showSelIcon(item)"></x-icon>
          </div>
        </r-scroll>
      </div>
      <!-- 底部栏 -->
      <div class="count_mode vux-1px-t">
        <span class="count_num"> {{tmpItems.length ? `已选 ${tmpItems.length} 个` : '请选择'}} </span>
        <span class="count_btn" @click="cfmMater">确定</span>
      </div>
    </popup>
  </div>
</template>

<script>
import { Icon, Popup, LoadMore, dateFormat } from 'vux'
import { getObjFacility, getWorkOrderTask  } from 'service/Product/gdService'
import RScroll from 'components/RScroll'
import MSearch from 'components/search'
  export default {
    name: "work-list-pop",
    props: {
      show: {
        type: Boolean,
        default: false
      },
      // 默认值
      defaultValue: {
        type: Array,
        default() {
          return []
        }
      },
    },
    components: {
      Icon, Popup, LoadMore, RScroll, MSearch
    },
    filters: {
      dateFormat
    },
    data() {
      return {
        showPop: false,
        srhInpTx: '', // 搜索框内容
        selItems: [], // 哪些被选中了
        tmpItems: [],
        workList: [],
        limit: 10,
        page: 1,
        hasNext: true,
        scrollOptions: {
          click: true,
          pullUpLoad: true,
        },
        filterList:[
          {
            name: '成品名称',
            value: 'inventoryName',
          }, {
            name: '成品编码',
            value: 'inventoryCode',
          },
          {
            name: '工序名称',
            value: 'procedureName'
          }
        ],
        filterProperty: ''
      }
    },
    watch: {
      show: {
        handler(val) {
          this.showPop = val;
        }
      },
      defaultValue: {
        handler(val) {
          // 默认值改变，重新赋值
          this.setDefaultValue();
        }
      },

    },
    methods: {
      // TODO 弹窗展示时调用
      onShow() {
        this.$nextTick(() => {
          if (this.$refs.bScroll) {
            this.$refs.bScroll.refresh();
          }
        })
      },
      // TODO 弹窗隐藏时调用
      onHide() {
        this.tmpItems = [...this.selItems];
        this.$emit('input', false);
        // 组件传值 传回给search组件 强制关闭下拉框
        this.$event.$emit('shut-down-filter', false);
      },
      // TODO 匹配相同项的索引
      findIndex(arr, sItem) {
        return arr.findIndex(item => {
          let isSameTransCode = true;
          if (item.transCode) {
            isSameTransCode = item.transCode === sItem.transCode;
          }
          return isSameTransCode && item.inventoryCode === sItem.inventoryCode
        });
      },
      // TODO 判断是否展示选中图标
      showSelIcon(sItem) {
        return this.tmpItems.findIndex(item => item.transCode === sItem.transCode && item.inventoryCode === sItem.inventoryCode) !== -1;
      },
      // TODO 选择物料
      selThis(sItem, sIndex) {
        let arr = this.tmpItems;
        let delIndex = arr.findIndex(item => item.transCode === sItem.transCode && item.inventoryCode === sItem.inventoryCode);
        // 若存在重复的 则清除
        if (delIndex !== -1) {
          arr.splice(delIndex, 1);
          return;
        }
        arr.push(sItem);
      },
      // TODO 设置默认值
      setDefaultValue() {
        this.tmpItems = [...this.defaultValue];
        this.selItems = [...this.defaultValue];
      },
      // TODO 获取物料列表
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
          limit: this.limit,
          page: this.page,
          start: (this.page - 1) * this.limit,
          filter: JSON.stringify(filter),
        }).then(({dataCount = 0, tableContent = []}) => {
          this.hasNext = dataCount > (this.page - 1) * this.limit + tableContent.length;
          this.workList = this.page === 1 ? tableContent : [...this.workList, ...tableContent];
          this.$nextTick(() => {
            this.$refs.bScroll.finishPullUp();
          })
        });
      },
      // TODO 确定选择物料
      cfmMater() {
        let sels = [];
        this.showPop = false;
        this.tmpItems.sort((a, b) => b.effectiveTime - a.effectiveTime);
        this.selItems = [...this.tmpItems];
        // 触发父组件选中事件
        this.$emit('sel-work', JSON.stringify(this.selItems));
      },
      // TODO 搜索物料
      searchList({val = '', property = ''}) {
        this.srhInpTx = val;
        this.filterProperty = property;
        this.workList = [];
        this.page = 1;
        this.hasNext = true;
        this.$refs.bScroll.scrollTo(0, 0);
        this.getWorkOrderTask();
      },
      // TODO 上拉加载
      onPullingUp() {
        this.page++;
        this.getWorkOrderTask();
      },
    },
    created() {
      this.setDefaultValue();
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
        height: calc(100% - .38rem);
        /* 使用深度作用选择器进行样式覆盖 */
        /deep/ .scroll-wrapper {
          padding: .14rem .04rem 0 .3rem;
        }
        // 每个物料
        .each-work {
          padding: .08rem;
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
          .work_mid {
            font-size: 0;
            padding: .04rem 0;
            .product_name {
              color: #111;
              font-size: .16rem;
              font-weight: bold;
            }
            .product_unit {
              .each_unit {
                color: #757575;
                font-size: .12rem;
                margin-right: .04rem;
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
        }
      }

    }
    // 底部栏
    .count_mode {
      left: 0;
      bottom: 0;
      width: 100%;
      display: flex;
      height: .44rem;
      position: fixed;
      line-height: .44rem;
      background: #fff;
      .count_num {
        flex: 2.5;
        color: #5077aa;
        font-size: .24rem;
        padding-left: .1rem;
      }
      .count_btn {
        flex: 1.5;
        color: #fff;
        text-align: center;
        background: #5077aa;
      }
    }
  }
</style>
