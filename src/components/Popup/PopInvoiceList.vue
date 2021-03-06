<template>
  <!-- 物料popup -->
  <div v-transfer-dom>
    <popup v-model="showPop" height="80%" class="trade_pop_part" @on-show="onShow" @on-hide="onHide">
      <div class="trade_pop">
        <m-search @search='searchList' @turn-off="onHide" :isFill='true'></m-search>
        <!-- 费用列表 -->
        <r-scroll class="mater_list" :options="scrollOptions" :has-next="hasNext"
                  :no-data="!hasNext && !costList.length" @on-pulling-up="onPullingUp"
                  ref="bScroll">
          <div class="each_mater box_sd" v-for="(item, index) in costList" :key='index'
               @click.stop="selThis(item, index)">
            <div class="mater_main ">
              <!-- 物料名称 -->
              <div class="mater_name">{{item.transCode}}</div>
              <div class="no_invoiced">{{item.inventoryName}}</div>
              <div class="no_invoiced">待{{getListMethod ? '开票' : '收票'}}金额: ￥{{item.amntBal}}</div>
            </div>
            <!-- icon -->
            <x-icon class="isSelIcon" type="ios-checkmark" size="20" v-show="showSelIcon(item)"></x-icon>
          </div>
        </r-scroll>
      </div>
    </popup>
  </div>
</template>

<script>
  import {Icon, Popup, LoadMore} from 'vux'
  import {getVATBilling, getVATReceipt, getManyVATBilling, getManyVATReceipt} from 'service/invoiceService'
  import RScroll from 'plugins/scroll/RScroll'
  import MSearch from 'components/search/search'
  import {sep} from 'path';

  export default {
    name: "InvoiceList",
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
      //请求的参数
      params: {
        type: Object,
        default() {
          return {}
        }
      },
      // 用于请求的key名，用于区分不同的接口
      getListMethod: {
        type: Boolean,
        default: true
      },
    },
    components: {
      Icon, Popup, LoadMore, RScroll, MSearch
    },
    data() {
      return {
        showPop: false,
        srhInpTx: '', // 搜索框内容
        selItems: [], // 哪些被选中了
        tmpItems: [],
        costList: [],
        limit: 10,
        page: 1.,
        hasNext: true,
        scrollOptions: {
          click: true,
          pullUpLoad: true,
        },
        dataCount: 0,
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
      params: {
        handler() {
          // 参数改变，重新请求接口
          this.getCostList();
        },
        deep: true
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
        // this.tmpItems = [...this.selItems];
        this.$emit('input', false);

      },
      // 判断是否展示选中图标
      showSelIcon(sItem) {
        let flag = false;
        this.selItems && this.selItems.every(item => {
          if (sItem.transCode === item.transMatchedCode) {
            flag = true;
            return false;
          }
          return true;
        });
        return flag;
      },
      // 选择物料
      selThis(sItem, sIndex) {
        //已经选择过的不允许再选
        let warn = ''
        this.selItems.every(item => {
          if (sItem.transCode === item.transMatchedCode) {
            warn = '该实例编码已选择，请选择其他';
            return false;

          }
          return true
        })
        if (warn) {
          this.$vux.alert.show({
            content: warn,
          });
          return
        }
        this.showPop = false;
        this.selItems = [sItem];
        this.$emit('sel-matter', this.selItems[0]);
      },
      // 设置默认值
      setDefaultValue() {
        // this.tmpItems = [...this.defaultValue];
        this.selItems = [...this.defaultValue];
      },
      // 获取物料列表
      getCostList() {
        let filter = [];
        let operation = getManyVATBilling;
        if (!this.getListMethod) {
          operation = getManyVATReceipt
        }
        if (this.srhInpTx) {
          filter = [
            ...filter,
            {
              operator: 'like',
              value: this.srhInpTx,
              property: 'transCode'
            },
          ];
        }
        return operation({
          limit: this.limit,
          page: this.page,
          start: (this.page - 1) * this.limit,
          filter: JSON.stringify(filter),
          ...this.params
        }).then(({dataCount = 0, tableContent = []}) => {
          this.dataCount = dataCount;
          this.hasNext = dataCount > (this.page - 1) * this.limit + tableContent.length;
          this.costList = this.page === 1 ? tableContent : [...this.costList, ...tableContent];
          this.$nextTick(() => {
            this.$refs.bScroll.finishPullUp();
          })
        });
      },
      // 搜索物料
      searchList({val = ''}) {
        this.srhInpTx = val;
        this.costList = [];
        this.page = 1;
        this.hasNext = true;
        this.$refs.bScroll.scrollTo(0, 0);
        this.getCostList();
      },
      // 上拉加载
      onPullingUp() {
        this.page++;
        this.getCostList();
      },
    },
    created() {
      this.setDefaultValue();
      this.getCostList();
    }
  }
</script>

<style scoped lang="scss">
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
        .each_mater {
          position: relative;
          display: flex;
          padding: 0.08rem;
          margin-bottom: .2rem;
          box-sizing: border-box;
          // 阴影
          &.box_sd {
            box-sizing: border-box;
            box-shadow: 0 0 8px #e8e8e8;
          }
          // 物料图片
          .mater_img {
            display: inline-block;
            width: .75rem;
            height: .75rem;
            img {
              width: 100%;
              max-height: 100%;
            }
          }
          // 物料主体
          .mater_main {
            padding-left: .04rem;
            box-sizing: border-box;
            display: inline-block;
            // 物料名称
            .mater_name {
              color: #111;
              font-size: .18rem;
            }
            .no_invoiced {
              font-size: 0.12rem;
              color: #757575;
            }
          }
          // 下划线
          .vux-1px-b:after {
            border-bottom: 1px solid #e8e8e8;
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
