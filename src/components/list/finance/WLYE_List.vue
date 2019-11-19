<template>
  <div class="pages" ref="list">
    <div class="content">
      <div class="list_top">
        <!-- 搜索栏 -->
        <searchIcon @search="searchList" :place-holder="tipsWord"></searchIcon>
        <!-- <div class="filter_part">
          <tab-item :tabVal='listView' @tab-click="tabClick"></tab-item>
        </div> -->
        <div class="tab-container" ref="tabContainer">
          <div class="tab-item" :class="{active: index === activeIndex}" v-for="(item, index) in listView"
               @click="tabClick(item, index)" ref="tabs">
            {{item.view_name}}
          </div>
        </div>
      </div>
      <!-- 列表 -->
      <div class="swiper-container list-container">
        <div class="swiper-wrapper">
          <div class="swiper-slide" v-for="(slide, key) in listMap" :key="key">
            <r-scroll class="list_wrapper" :options="scrollOptions" :has-next="hasNext"
                      :no-data="!hasNext && !listData.length" @on-pulling-up="onPullingUp" @on-pulling-down="onPullingDown"
                      ref="bScroll">
              <!-- 核销余额表 -->
              <template v-if="activeTab.includes('核销余额')">
                <div class="verification-item-wrapper" v-for='(item, index) in listData' :key='index'>
                  <div class="verification-main">
                    <img class="verification_img" :src="item.appIcon">
                    <div class="verification_info">
                      <div class="app_name">{{item.appTitle}}</div>
                      <div class="verification_info_item">
                        <span class="verification_info_title">应用类型: </span>{{item.transName}}
                      </div>
                      <div class="verification_info_item">
                        <span class="verification_info_title">实例编码: </span>{{item.transCode}}
                      </div>
                      <div class="verification_info_item">
                        <span class="verification_info_title">往来编码: </span>{{item.dealerCode}}
                      </div>
                      <div class="verification_info_item">
                        <span class="verification_info_title">往来名称: </span>{{item.dealerName}}
                      </div>
                      <div class="verification_info_item">
                        <span class="verification_info_title">结算方式: </span>{{item.paymentTerm || '无'}}
                      </div>
                      <div class="verification_info_item">
                        <span class="verification_info_title">记账日期与时间: </span>
                        {{item.effectiveTime | dateFormat('YYYY-MM-DD')|| '无'}}
                      </div>
                      <div class="verification_info_item">
                        <span class="verification_info_title">到期日: </span>
                        {{item.paymentDays | dateFormat('YYYY-MM-DD')|| '无'}}
                      </div>
                    </div>
                  </div>
                  <div class="verification-split"></div>
                  <div class="verification-bottom">
                    <div class="verification_bottom_item days">
                      <div class="verification_bottom_value">{{item.daysOfAccount || 0}}</div>
                      <div class="verification_bottom_title">账期天数</div>
                    </div>
                    <div class="verification_bottom_item acount_day">
                      <div class="verification_bottom_value">{{item.paymentSurplusDays || '无'}}</div>
                      <div class="verification_bottom_title">剩余天数</div>
                    </div>
                    <div class="verification_bottom_item">
                      <div class="verification_bottom_value">{{item.accountAge}}</div>
                      <div class="verification_bottom_title">账龄天数</div>
                    </div>
                  </div>
                  <div class="verification-bottom">
                    <div class="verification_bottom_item days">
                      <div class="verification_bottom_value">{{item.drAmnt | numberComma}}</div>
                      <div class="verification_bottom_title">发生金额</div>
                    </div>
                    <div class="verification_bottom_item">
                      <div class="verification_bottom_value">{{item.crAmnt}}</div>
                      <div class="verification_bottom_title">已核销</div>
                    </div>
                    <div class="verification_bottom_item amt">
                      <div class="verification_bottom_value">
                        {{item.amountBalance | numberComma}}
                      </div>
                      <div class="verification_bottom_title">金额余额</div>
                    </div>
                  </div>
                </div>
              </template>
              <!-- 手动核销明细 -->
              <template v-else-if="activeTab.includes('手动核销明细')">
                <div class="classification-item-wrapper" v-for='(item, index) in listData' :key='index'>
                  <div class="classification-header-wrapper">
                    <div class="classification_app">
                      <div class="app_top">
                        <div class="app_name">{{item.appTitle}}</div>
                      </div>
                      <div class="classification_detail_item">
                        <span class="classification_detail_title">应用类型: </span>{{item.transName}}
                      </div>
                      <div class="classification_detail_item">
                        <span class="classification_detail_title">实例编码: </span>{{item.transCode}}
                      </div>
                      <div class="classification_detail_item">
                        <span class="classification_detail_title">记账与生效日期: </span>
                        {{item.effectiveTime | dateFormat('YYYY-MM-DD')}}
                      </div>
                    </div>
                  </div>
                  <div class="classification-split"></div>
                  <div class="dealer-info">
                    <div class="dealer_detail">
                      <div class="dealer">
                        <span class="title">往来名称: </span>{{item.dealerName || '暂无'}}
                      </div>
                      <div class="dealer">
                        <span class="title">往来编码: </span>{{item.dealerCode || '暂无'}}
                      </div>
                      <div class="dealer">
                        <span class="title">往来关系标签: </span>{{item.dealerLabel || '暂无'}}
                      </div>
                    </div>
                    <div class="dealer_amt_wrapper">
                      <div class="dealer_amt">{{item.amount | numberComma}}
                      </div>
                      <div class="text">核销金额</div>
                    </div>
                  </div>
                </div>
              </template>
              <template v-else>
                <div class="each_duty" v-for="(item, index) in listData" :key="index" @click="getFlow(item)">
                  <div class="duty_top">
                    <!-- 表单状态 及 编码 -->
                    <div class="basic_info">
                      <!-- 状态 -->
                      <span class="warehouse warehouse_name">
                          <!-- 往来关系标签/二级科目 -->
                          {{item.accountSub}}
                        </span>
                      <!-- 往来编码 -->
                      <span class="warehouse warehouse_code">{{item.dealerCode}}</span>
                    </div>
                    <!-- 数量余额 -->
                    <div class="mater_code" v-if="item.accountAge !== undefined">
                      <span class="title">账龄天数</span>
                      <span class="num">{{item.accountAge}}</span>
                    </div>
                  </div>
                  <!-- 往来名称 -->
                  <div class="matter" v-if="item.dealerName">
                    <div class="matter_name">
                      {{item.dealerName}}
                    </div>
                  </div>
                  <!-- 金额余额等 -->
                  <div class="duty_btm" :class="{'vux-1px-t': item.dealerName}">
                    <!-- 仓库类型 -->
                    <div class="ware_type"></div>
                    <!-- 余额 -->
                    <div class="balance" v-if="item.amountBalance !== ''">
                      <span class="symbol" >余额: </span><span class='detail_font' :class="{'red': item.amountBalance < 0}">{{item.amountBalance| toFixed | numberComma}}</span>
                    </div>
                  </div>
                </div>
              </template>
            </r-scroll>
          </div>
        </div>
      </div>
      <!-- 点击展开状态 -->
      <div v-transfer-dom>
        <popup v-model="flowShow" position="bottom" height="80%">
          <r-scroll class="flow_list_wrapper" ref="flowListWrapper"
                    :options="FlowScrollOptions" :has-next="FlowHasNext"
                    :no-data="!FlowHasNext && !flowData.length" @on-pulling-up="onPullingUpFlow">
            <div class="flow">
              <div class="flow_top">
                <div class="title">流水详情</div>
              </div>
              <div class="flow_list">
                <div class="each_flow" v-for="(Fitem,Findex) in flowData" :key="Findex"
                     @click.stop="Fitem.showList = !Fitem.showList">
                  <!--展开状态-->
                  <div class="duty_top">
                    <!-- 实例编码 -->
                    <div class="transCode">
                      <span class="order_title">编码</span>
                      <span class="order_num">{{Fitem.transCode}}</span>
                    </div>
                    <!-- 时间 -->
                    <div class="time">
                      {{Fitem.calcTime | dateFormat}}
                    </div>
                  </div>

                  <!-- 数量，金额 -->
                  <div class="show_list">
                    <!-- 应用名称 -->
                    <div class="app_name">
                      {{Fitem.appTitle}}<span class="symbol">[应用]</span>
                    </div>
                    <div class="num_info">
                      <!-- 数量 -->
                      <div class="count">
                        <div class="num_part">
                          <span class="symbol">借方金额: </span>
                          <span class="number_incre" v-if="Fitem.drAmnt > 0">
                            {{Fitem.drAmnt | toFixed}}
                          </span>
                          <span v-else>&nbsp;0</span>
                        </div>
                      </div>
                      <!-- 金额 -->
                      <div class="amount_money">
                        <div class="num_part">
                          <span class="symbol">贷方金额: </span>
                          <span class="number_incre" v-if="Fitem.crAmnt > 0">
                            {{Fitem.crAmnt | toFixed}}
                          </span>
                          <span v-else>&nbsp;0</span>
                        </div>
                      </div>
                      <!-- 时间 -->
                      <div class="count">
                        <div class="num_part">
                          <span class="symbol">记账日期与时间: </span>
                          <span>&nbsp;{{Fitem.effectiveTime | dateFormat}}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="summary_part vux-1px-t">
                    <div class="number"></div>
                    <div class="price">
                      <span class="symbol">当前余额:</span>
                      <span :class="{increase: Fitem.amountBalance > 0, reduce: Fitem.amountBalance < 0}">
                        {{Fitem.amountBalance | toFixed | numberComma}}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </r-scroll>
          <div class="btn when_less">
            <span class="cfm_btn" @click="flowShow = false">关闭</span>
          </div>
        </popup>
      </div>
    </div>
  </div>
</template>

<script>
import TabItem from 'components/public/sub-tab'
import listCommon from 'mixins/kmListCommon'
import {getListClassfiy, getViewList} from 'service/kmService'
import { toFixed } from '@/plugins/calc'

const BASE_PARAMS = {
  page: 1,
  limit: 20,
  hasNext: true,
  listData: [],
};

export default {
  data() {
    return {
      uniqueId: 9000,
      showContent: false,
      handleLoadding: false,
      filterArr: [
        {operator: 'like', value: '', property: 'dealerCode'}
      ],
      listMap: {},
    }
  },
  computed: {
    // 当前滑块
    currentItem() {
      let {view_id} = this.listView[this.activeIndex];
      return this.listMap[view_id];
    },
    // 当前滚动容器
    currentScroll() {
      return this.$refs.bScroll[this.activeIndex]
    },
    // 搜索提示文字
    tipsWord() {
      let currentView = this.view_id;
      let viewList = {
        view_12: '往来名称/往来编码/往来标签/账龄天数', 
        view_50: '应用名称/往来编码/往来名称/往来标签/结算方式/账龄', 
        view_58: '往来名称/往来编码/往来标签/账龄天数',
        view_60: '往来名称/往来编码/往来标签/账龄天数'
      };
      if (viewList.hasOwnProperty(currentView)) return viewList[currentView];
    }
  },
  components:{
    TabItem
  },
  mixins: [listCommon],
  filters: { toFixed },
  methods:{
    // 重置列表条件
    resetCondition() {
      let {view_id} = this.listView[this.activeIndex];
      this.listMap[view_id] = {...BASE_PARAMS};
      this.currentScroll.scrollTo(0, 0);
      this.currentScroll.resetPullDown();
    },
    // tab切换
    tabClick(val, index) {
      if (index === this.activeIndex) {
        this.currentScroll.scrollTo(0, 0);
        return;
      }
      this.activeIndex = index;
      this.activeTab = val.view_name;
      this.calc_rel_code = val.calc_rel_code;
      this.view_id = val.view_id;
      this.currentScroll.scrollTo(0, 0);
      this.resetCondition();
      this.listSwiper.slideTo(index);
    },
    //获取列表视图
    getClassfiy() {
      return getListClassfiy({
        account_code: this.uniqueId,
        device_type: 'phone'
      }).then(({data = []}) => {
        let [first = {}] = data;
        let listMap = {};
        data.forEach(item => {
          listMap[item.view_id] = {...BASE_PARAMS};
        });
        this.listMap = listMap;
        this.listView = data;
        this.activeTab = first.view_name;
        this.calc_rel_code = first.calc_rel_code;
        this.view_id = first.view_id;
        this.$nextTick(() => {
          this.listSwiper.update();
        })
      })
    },
    //获取列表数据
    getListData(noReset = false) {
      let {page, limit} = this.currentItem;
      return getViewList({
        user_code: 1,
        page: page,
        limit: limit,
        view_scope: 'data',
        device_type: 'phone',
        view_id: this.view_id,
        filter: this.serachVal,
        calc_rel_code: this.calc_rel_code,
        start: (page - 1) * limit,
      }).then(({data = [], total = 0}) => {
        let bankMap = {
          '交通银行': require('assets/iconfont/bank/bank_jt.png'),
          '建设银行': require('assets/iconfont/bank/bank_js.png'),
          '中国银行': require('assets/iconfont/bank/bank_zg.png'),
          '招商银行': require('assets/iconfont/bank/bank_zs.png'),
        };
        this.currentItem.hasNext = total > (page - 1) * limit + data.length;
        data.forEach(item => {
          item.status = false;
          if (item.cashInOrOut) {
            switch (item.cashInOrOut) {
              case '流入':
                item.flowIconClass = 'iconfont icon-shangjiantou';
                item.flowWordClass = 'cashIn';
                break;
              case '流出':
                item.flowIconClass = 'iconfont icon-xiajiantou-copy';
                item.flowWordClass = 'cashOut';
                break;
            }
          }
          if (this.activeTab.includes('资金账户余额')) {
            item.icon = bankMap[item.bank];
          } else if (this.activeTab.includes('现金流计划表')) {
            item.appIcon = `/dist/${item.appIcon}`;
          }
        });
        this.listData = page === 1 ? data : this.listData.concat(data);
        this.currentItem.listData = page === 1 ? data : [...this.currentItem.listData, ...data];
        if (!noReset) {
          this.$nextTick(() => {
            this.resetScroll();
          })
        }
        // 判断最近有无新增数据
        let text = '';
        if (noReset && this.activeIndex === 0) {
          if (this.total) {
            text = total - this.total === 0 ? '暂无新数据' : text = `新增${total - this.total}条数据`;
            this.$vux.toast.show({
              text: text,
              position: 'top',
              width: '50%',
              type: "text",
              time: 700
            })
          }
        }
        //列表总数据缓存
        if (this.activeIndex === 0 && page === 1) {
          sessionStorage.setItem(this.applyCode, total);
        }
        this.$loading.hide();
      }).catch(e => {
        this.resetScroll();
      })
    },
    //根据视图获取订单数据
    async getList(noReset = false) {
      await this.getView();
      await this.getListData(noReset);
    },
    // 重置下拉刷新、上拉加载的状态
    resetScroll() {
      this.currentScroll.finishPullDown();
      this.currentScroll.finishPullUp();
    },
    // 上拉加载
    onPullingUp() {
      this.currentItem.page++;
      this.getListData();
    },
    // 下拉刷新
    onPullingDown() {
      this.currentItem.page = 1;
      this.getData(true);
    },
    async getData(noReset) {
      await this.getSession();
      if (noReset) {
        await this.getList(true).then(() => {
          this.$nextTick(() => {
            this.currentScroll.finishPullDown().then(() => {
              this.currentScroll.finishPullUp();
            });
          })
        });
        return
      }
      await this.getList();
    },
    // 初始化swiper
    initSwiper() {
      this.$nextTick(() => {
        this.listSwiper = new this.Swiper('.list-container', {
          touchAngle: 30,
          on: {
            slideChangeTransitionStart: () => {
              let index = this.listSwiper.activeIndex;
              let tab = this.listView[index];
              this.activeIndex = index;
              this.activeTab = tab.view_name;
              this.calc_rel_code = tab.calc_rel_code;
              this.view_id = tab.view_id;
              this.scrollToShow(index);
              // 已有数据则不重新请求
              if (this.currentItem.listData.length) {
                return
              }
              //this.resetCondition();
              this.getListData();
            },
          },
        });
      })
    },
    // 滑动显示完整名字
    scrollToShow(index) {
      let $container = this.$refs.tabContainer;
      let paddingLeft = parseFloat(getComputedStyle($container).paddingLeft);
      let $activate = this.$refs.tabs[index];
      $container.scrollLeft = $activate.offsetLeft - paddingLeft;
    },
  },
  created() {
    this.initSwiper();
  }
}
</script>

<style lang='scss' scoped>
  @import '~scss/subject/subList';
  .list_wrapper {
    height: calc(100% - 1rem);
  }
  .tab-container {
    display: flex;
    align-items: center;
    padding: 0 .15rem;
    width: 100%;
    height: .46rem;
    color: #333;
    white-space: nowrap;
    overflow: auto;
    box-sizing: border-box;
    .tab-item {
      line-height: .14rem;
      font-size: .14rem;
      & + .tab-item {
        margin-left: .2rem;
      }
      &:last-child {
      }
      padding-right: .15rem;
      &.active {
        line-height: .18rem;
        color: #3296FA;
        font-size: .18rem;
        font-weight: 600;
      }
    }
  }
  .verification-item-wrapper {
    color: #333;
    margin: .1rem;
    position: relative;
    border-radius: 4px;
    background: #FFF;
    padding: .2rem .15rem;
    box-sizing: border-box;
    width: calc(100% - .2rem);
    box-shadow: 0 2px 10px 0 rgba(0, 0, 0, 0.1);
    .verification-main {
      display: flex;
      .verification_img {
        width: .5rem;
        height: .5rem;
        border-radius: .04rem;
      }
      .verification_info {
        margin-left: .12rem;
        line-height: .12rem;
        font-size: .12rem;
      }
      .app_name {
        line-height: .18rem;
        font-size: .14rem;
        font-weight: 600;
      }
      .verification_info_item {
        margin-top: .12rem;
        & + .verification_info_item {
          margin-top: .08rem;
        }
      }
      .verification_info_title {
        color: #999;
      }
    }

    .verification-split {
      position: relative;
      margin: .2rem 0 .13rem;
      height: 1px;
      border-top: 1px dashed #DEDFE6;
    }

    .verification-bottom {
      font-size: .12rem;
      text-align: center;
      position: relative;
      line-height: .12rem;
      .verification_bottom_item {
        &.days, &.amt, &.acount_day {
          position: absolute;
        }
        &.days {
          left: 0;
        }
        &.amt {
          top: -1px;
          right: 0;
          color: #FA7138;
          .verification_bottom_value {
            font-weight: bold;
            font-size: .16rem;
          }
        }
        &.acount_day {
          top: -1px;
          right: 0;
        }
      }
      .verification_bottom_value {
        font-size: .14rem;
      }
      .verification_bottom_title {
        margin-top: .08rem;
        color: #999;
      }
      .symbol {
        font-size: .12rem;
      }
      & + .verification-bottom {
        margin-top: .2rem;
      }
    }
  }
  .classification-item-wrapper {
    color: #333;
    margin: .1rem;
    position: relative;
    border-radius: 4px;
    background: #FFF;
    padding: .2rem .15rem;
    box-sizing: border-box;
    width: calc(100% - .2rem);
    box-shadow: 0 2px 10px 0 rgba(0, 0, 0, 0.1);
    .classification-header-wrapper {
      .app_top {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .app_name {
        line-height: .18rem;
        font-size: .14rem;
        font-weight: bold;
      }
      .app_flow {
        padding: .04rem .06rem;
        line-height: .12rem;
        border: 1px solid;
        border-radius: .04rem;
        font-size: .1rem;
        &.cashOut {
          color: #FB880B;
        }
        &.cashIn {
          color: #00D38B;
        }
      }
      .iconfont {
        font-size: .1rem;
        font-weight: bold;
      }

      .classification_detail_item {
        margin-top: .1rem;
        line-height: .12rem;
        font-size: .12rem;
        & + .classification_detail_item {
          margin-top: .08rem;
        }
      }
      .classification_detail_title {
        color: #696969;
      }
    }

    /* 分割线 */
    .classification-split {
      position: relative;
      margin: .17rem 0 .12rem;
      height: 1px;
      border-top: 1px dashed #DEDFE6;
    }

    .dealer-info {
      display: flex;
      align-items: center;
      justify-content: space-between;
      .dealer {
        line-height: .18rem;
        font-size: .12rem;
        .title {
          color: #999;
        }
      }
      .dealer_account {
        margin-top: .07rem;
        line-height: .12rem;
        font-size: .12rem;
        .title {
          color: #696969;
        }
      }
      .dealer_amt_wrapper {
        text-align: center;
      }
      .dealer_amt {
        line-height: .17rem;
        color: #FA7138;
        font-size: .18rem;
        font-weight: 600;
      }
      .symbol {
        font-size: .12rem;
      }
      .text {
        margin-top: .08rem;
        line-height: .12rem;
        color: #999;
        font-size: .12rem;
      }
    }

    .dealer-name {
      margin: .18rem 0 0;
      line-height: .18rem;
      font-size: .14rem;
      font-weight: 600;
    }
    .flow-info {
      margin-top: .12rem;
      line-height: .12rem;
      font-size: .12rem;
      .flow_info_item {
        display: flex;
        & + .flow_info_item {
          margin-top: .08rem;
        }
        /* 账户大类 */
        .flow_account_sub {
          margin-left: .1rem;
          .title {
            color: #696969;
          }
        }
        .title {
          color: #999;
        }
      }
    }
  }
  .red{
    color: red;
  }
  .matter_name{
    font-weight: 600;
  }
  .detail_font{
    font-weight: 600;
  }
</style>
