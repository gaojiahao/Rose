<template>
  <div class="pop-salesman-list-container">
    <div class="SJForm_cell" @click="itemClick">
      <div :class="{required: required}">{{title}}</div>
      <div class="value">{{currentValue || '请选择'}}</div>
    </div>
    <!-- 销售人员、渠道popup -->
    <div v-transfer-dom>
      <popup v-model="showPop" height="80%" class="trade_pop_part" @on-show="onShow" @on-hide="onHide">
        <div class="trade_pop">
          <r-search @search="searchList" @turn-off="onHide" :isFill='true'></r-search>
          <r-scroll class="salesman-list" :options="scrollOptions" :has-next="hasNext"
                    :no-data="!hasNext && !dealerList.length" @on-pulling-up="onPullingUp" ref="bScroll">
            <div class="mater-list-item" v-for="(item, index) in dealerList" :key='index'
                 @click.stop="selThis(item, index)">
              <div class="mater-list-item-content">
                <!-- 名称 -->
                <div class="name">{{item.dealerName}}</div>
                <!-- 地址 -->
                <div>{{item.province}}{{item.city}}{{item.county}}{{item.address}}</div>
              </div>
              <!-- icon -->
              <x-icon class="isSelIcon" type="ios-checkmark" size="20" v-show="showSelIcon(item)"></x-icon>
            </div>
          </r-scroll>
        </div>
      </popup>
    </div>
  </div>
</template>

<script>
  import {Icon, Popup, AlertModule, TransferDom} from 'vux'
  import {getObjDealerByLabelName} from 'service/commonService'
  import RScroll from 'plugins/scroll/RScroll'
  import RSearch from 'components/search/search'

  export default {
    name: "PopSalesmanList",
    props: {
      title: {
        type: String,
        default: ''
      },
      dealerLabelName: {
        type: String,
        default: '员工'
      },
      disabled: {
        type: Boolean,
        default: false
      },
      value: {
        type: String,
        default: ''
      },
      required: {
        type: Boolean,
        default: false
      }
    },
    directives: {TransferDom},
    components: {
      Icon, Popup, RScroll, RSearch,
    },
    data() {
      return {
        showPop: false,
        srhInpTx: '', // 搜索框内容
        dealerList: [],
        limit: 10,
        page: 1.,
        hasNext: true,
        scrollOptions: {
          click: true,
          pullUpLoad: true,
        },
        currentValue: '',
      }
    },
    watch: {
      value: {
        handler(val) {
          this.currentValue = this.value;
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
        this.showPop = false;
      },
      // 判断是否展示选中图标
      showSelIcon(sItem) {
        return sItem.dealerName === this.currentValue;
      },
      // 选择商机
      selThis(sItem, sIndex) {
        let val = sItem.dealerName;
        this.showPop = false;
        this.currentValue = val;
        this.$emit('input', val)
      },
      // 获取销售列表
      getDealer() {
        let filter = [];
        if (this.srhInpTx) {
          filter = [{
            operator: 'like',
            value: this.srhInpTx,
            property: 'dealerName',
          }]
        }
        return getObjDealerByLabelName({
          limit: this.limit,
          page: this.page,
          start: (this.page - 1) * this.limit,
          dealerLabelName: this.dealerLabelName,
          filter: JSON.stringify(filter),
        }).then(({dataCount = 0, tableContent = []}) => {
          this.hasNext = dataCount > (this.page - 1) * this.limit + tableContent.length;
          this.dealerList = this.page === 1 ? tableContent : [...this.dealerList, ...tableContent];
          this.$nextTick(() => {
            this.$refs.bScroll.finishPullUp();
          })
        }).catch(e => {
          AlertModule.show({
            content: e.message,
          })
        })
      },
      // 上拉加载
      onPullingUp() {
        this.page++;
        this.getDealer();
      },
      // 点击展示弹窗
      itemClick() {
        this.showPop = true;
      },
      searchList({val = ''}){
        this.srhInpTx = val;
        this.dealerList = [];
        this.page = 1;
        this.hasNext = true;
        this.$refs.bScroll.scrollTo(0, 0);
        this.getDealer();
      },
    },
    created() {
      this.getDealer();
      this.currentValue = this.value;
    }
  }
</script>

<style scoped lang="scss">
  .SJForm_cell {
    padding: 10px 0;
    display: flex;
    justify-content: space-between;
    position: relative;
    &:before {
      content: " ";
      position: absolute;
      left: 0;
      top: 0;
      right: 0;
      border-top: 1px solid #D9D9D9;
      color: #D9D9D9;
      transform-origin: 0 0;
      transform: scaleY(0.5);
    }
    .required {
      font-weight: bold;
      color: #5077aa;
    }
    .value {
      color: #757575;
    }
  }

  // 弹出层
  .trade_pop_part {
    background: #fff;
    .trade_pop {
      
      height: 100%;
      overflow: hidden;
      box-sizing: border-box;
      // 顶部
      .title {
        position: relative;
        font-size: .2rem;
      }
      // 销售列表
      .salesman-list {
        width: 100%;
        overflow: hidden;
        box-sizing: border-box;
        height: calc(100% - .46rem);
        /deep/ .scroll-wrapper {
          padding: .04rem .04rem 0 .3rem;
        }
        // 每个销售
        .mater-list-item {
          position: relative;
          display: flex;
          padding: 0.08rem;
          margin-bottom: .2rem;
          box-shadow: 0 0 8px #e8e8e8;
          box-sizing: border-box;
          // 销售主体
          .mater-list-item-content {
            flex: 1;
            padding-left: .1rem;
            box-sizing: border-box;
            display: inline-block;
            color: #757575;
            font-size: .14rem;
            .name {
              color: #5077aa;
              font-size: .14rem;
              font-weight: bold;
            }
            .code {
              color: #111;
              font-weight: bold;
            }
          }
          // 选择icon
          .selIcon, .isSelIcon {
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
    .trade_pop_title {
      font-size: .2rem;
      position: relative;
      padding: 0.08rem 0;
      // 关闭icon
      .close_icon {
        top: 45%;
        right: 0;
        position: absolute;
        transform: translate(0, -50%);
      }
    }
  }
</style>
