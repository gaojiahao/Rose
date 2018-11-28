<template>
  <div class="pop_dealer_list">
    <div class='dealer-info' @click="showDealerPop = !showDealerPop">
      <div class='user-content' v-if="selInfo.dealerCode">
        <div class="user-info">
          <div class="user-name">
            <span class="user-tips">{{selInfo.dealerLabelName}}</span>
            <span>{{selInfo.dealerName || selInfo.nickname}}</span>
          </div>
        </div>
        <div class="cp-info">
          <span>编码: {{selInfo.dealerCode}}</span>
          <span>余额: {{selInfo.amntBal | numberComma}}</span>
        </div>
      </div>
      <div class='user-content' v-else>
        <div class="title">{{dealerLabelName}}信息</div>
        <div class="required">请选择{{dealerLabelName}}</div>
      </div>
      <span class="iconfont icon-youjiantou r-arrow"></span>
    </div>
    <slot name="other" v-if="selInfo.dealerCode"></slot>
    <!-- 往来 Popup -->
    <div v-transfer-dom>
      <popup v-model="showDealerPop" height="80%" class="trade_pop_part" @on-show="onShow" @on-hide="onHide">
        <div class="trade_pop">
          <div class="title">
            <!-- 搜索栏 -->
            <d-search @search="searchList" @turn-off="onHide" :isFill="true"></d-search>
          </div>
          <!-- 往来列表 -->
          <r-scroll class="pop-list" :options="scrollOptions" :has-next="hasNext"
                    :no-data="!hasNext && !listData.length" @on-pulling-up="onPullingUp" ref="bScroll">
            <div class="pop-item" v-for="(item, index) in listData" :key='index' @click.stop="selItem(item, index)">
              <div class="top">
                <span class="name">{{item.dealerName || item.nickname}}</span>
                <span class="label">{{item.dealerLabelName}}</span>
              </div>
              <div class="amt">
                <span>编码: {{item.dealerCode}}</span>
                <span>往来余额: {{item.amntBal | numberComma}}</span>
              </div>
              <!-- icon -->
              <!--<x-icon class="selIcon" type="ios-circle-outline" size="20"></x-icon>-->
              <x-icon class="isSelIcon" type="ios-checkmark" size="20" v-show="showSelIcon(item)"></x-icon>
            </div>
          </r-scroll>
        </div>
      </popup>
    </div>
  </div>
</template>

<script>
  import {Icon, Popup, LoadMore, AlertModule, numberComma} from 'vux'
  import DSearch from 'components/search'
  import {getPaySupplierArrears, getDepositToPaySuppliers} from 'service/dealerService'
  import RScroll from 'components/RScroll'

  export default {
    name: "PopDealerList",
    props: {
      dealerLabelName: {
        type: String,
        default: "供应商"
      },
      // 默认值
      defaultValue: {
        type: Object,
        default() {
          return {}
        }
      },
      required: {
        type: Boolean,
        default: false
      },
      placeholder: {
        type: String,
        default: '请选择'
      },
      // 请求接口
      request: {
        type: String,
        default: '0'
      }
    },
    components: {
      Icon, Popup, DSearch, RScroll,
    },
    data() {
      return {
        page: 1,
        limit: 10,
        hasNext: true,
        showDealerPop: false,
        srhInpTx: '',           // 搜索框内容
        selInfo: {},         // 往来信息
        selItems: [],           // 哪些被选中了
        listData: [],
        scrollOptions: { // 滚动配置
          pullUpLoad: true,
        },
        requestMethods: null,
      }
    },
    watch: {
      defaultValue: {
        handler() {
          let defaultValue = this.defaultValue;
          this.selInfo = Object.freeze({...defaultValue});
          this.selItems = [{...defaultValue}]
        },
        immediate: true
      },
    },
    methods: {
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
        this.showDealerPop = false;
      },
      // TODO 判断是否展示选中图标
      showSelIcon(sItem) {
        return this.selItems.findIndex(item => item.dealerCode === sItem.dealerCode) !== -1;
      },
      // TODO 选择往来
      selItem(sItem, sIndex) {
        this.showDealerPop = false;
        this.selItems = [sItem];
        this.selInfo = Object.freeze({...sItem});
        this.$emit('sel-item', {...this.selInfo});
      },
      // 选择联系人
      selContact(item) {
        this.$emit('sel-contact', item);
      },
      // TODO 获取往来列表
      getDealer() {
        let filter = [];
        if (this.srhInpTx) {
          filter = [
            ...filter,
            {
              operator: 'like',
              value: this.srhInpTx,
              // property: 'dealerName',
              property: 'nickname',
            },
          ];
        }
        return this.requestMethods({
          limit: this.limit,
          page: this.page,
          start: (this.page - 1) * this.limit,
          filter: JSON.stringify(filter),
        }).then(({dataCount = 0, tableContent = []}) => {
          this.hasNext = dataCount > (this.page - 1) * this.limit + tableContent.length;
          this.listData = this.page === 1 ? tableContent : [...this.listData, ...tableContent];
          this.$nextTick(() => {
            this.$refs.bScroll.finishPullUp();
          })
        }).catch(e => {
          AlertModule.show({
            content: e.message,
          })
        })
      },
      // TODO 搜索往来
      searchList({val = ''}) {
        this.srhInpTx = val;
        this.listData = [];
        this.page = 1;
        this.hasNext = true;
        this.$refs.bScroll.scrollTo(0, 0);
        this.getDealer();
      },
      itemClick() {
        this.showDealerPop = true;
      },
      onPullingUp() {
        this.page++;
        this.getDealer();
      }
    },
    filters: {
      numberComma,
    },
    created() {
      let serviceList = [getPaySupplierArrears, getDepositToPaySuppliers];
      this.requestMethods = serviceList[this.request];
      this.getDealer();
    }
  }
</script>

<style scoped lang="scss">
  @import '~@/scss/color.scss';

  .vux-1px-t:before {
    border-color: #e8e8e8;
  }

  .required {
    color: $required;
    font-weight: bold;
  }

  .pop_dealer_list {
    width: 95%;
    margin: .1rem auto;
    background: #fff;
    margin-bottom: 0.1rem;
    box-sizing: border-box;
    padding: .06rem .1rem;
    .title {
      color: #757575;
      font-size: .12rem;
      &.required {
        color: $required;
        font-weight: bold;
      }
    }
    .mode {
      font-weight: 500;
    }
    .r-arrow {
      top: 50%;
      right: -1%;
      font-weight: bold;
      position: absolute;
      transform: translate(0, -50%);
    }
    .dealer-info {
      position: relative;
      width: 100%;
      .user-content {
        .user-info {
          font-size: 0;
          color: #111;
          font-weight: 500;
          .user-tips {
            color: #FFF;
            font-size: .1rem;
            padding: 0 .06rem;
            border-radius: .3rem;
            background: #5077aa;
            vertical-align: middle;
          }
          .user-name {
            max-width: 90%;
            overflow: hidden;
            font-size: .16rem;
            white-space: nowrap;
            margin-right: .04rem;
            display: inline-block;
            vertical-align: middle;
            text-overflow: ellipsis;
          }
          .user-tel {
            font-size: .16rem;
            font-weight: bold;
            display: inline-block;
            font-family: Helvetica;
            vertical-align: middle;
            margin-bottom: -.02rem;
          }
        }
      }
    }

    .cp-info {
      font-size: .12rem;
      color: #757575;
    }
  }

  // 弹出层
  .trade_pop_part {
    background: #fff;
    .trade_pop {
      padding: 0 .08rem;
      height: 100%;
      overflow: hidden;
      // 顶部
      .title {
        position: relative;
        margin: 0.08rem 0;
        font-size: .2rem;
      }
      // 往来列表
      .pop-list {
        width: 100%;
        overflow: hidden;
        box-sizing: border-box;
        height: calc(100% - .38rem);
        /* 使用深度作用选择器进行样式覆盖 */
        /deep/ .scroll-wrapper {
          padding: .04rem .04rem 0 .3rem;
        }
        // 每个物料
        .pop-item {
          position: relative;
          padding: 0.08rem;
          margin-bottom: .2rem;
          box-shadow: 0 0 8px #e8e8e8;
          box-sizing: border-box;
          .top {
            display: flex;
            align-items: baseline;
            .name {
              margin-right: .05rem;
              font-size: .14rem;
              font-weight: bold;
            }
            .label {
              color: #757575;
              font-size: .12rem;
            }
          }
          .amt {
            margin-top: .05rem;
            color: #757575;
            font-size: .12rem;
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
  }
</style>
