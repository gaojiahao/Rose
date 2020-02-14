<template>
  <div class="pages">
    <div class='content'>
      <slot name="nav"></slot>
      <div class="list_top">
        <!-- 搜索栏 -->
        <searchIcon @search='searchList' :place-holder="tipsWord"></searchIcon>
        <div class="tab-container" ref="tabContainer">
          <div class="tab-item" :class="{active: index === activeIndex}" v-for="(item, index) in listView"
               @click="tabClick(item, index)" ref="tabs" :key="index">
            {{item.view_name}}
          </div>
        </div>
      </div>
      <div class="swiper-container list-container">
        <div class="swiper-wrapper">
          <div class="swiper-slide" v-for="(slide, key) in listMap" :key="key">
            <r-scroll class="list_wrapper" :options="scrollOptions" :has-next="slide.hasNext"
                      :no-data="!slide.hasNext && !slide.listData.length" @on-pulling-up="onPullingUp"
                      @on-pulling-down="onPullingDown" ref="bScroll">
              <!-- 现金流分类识别 -->
              <template v-if="key === 'view_49'">
                <div class="classification-item-wrapper" 
                  v-for='(item, index) in slide.listData' 
                  @click="goInstanceDetail(item)" 
                  :key='index'>
                  <div class="classification-header-wrapper">
                    <img class="classification_img" :src="item.AppIcon" alt="icon">
                    <div class="classification_app">
                      <div class="app_top">
                        <div class="app_name">{{item.appTitle}}</div>
                        <div class="app_flow" :class="item.flowWordClass">
                          {{item.direction}}<i :class="item.flowIconClass"></i>
                        </div>
                      </div>
                      <div class="classification_detail_item">
                        <span class="classification_detail_title">实例编码：</span>{{item.transCode}}
                      </div>
                      <div class="classification_detail_item">
                        <span class="classification_detail_title">往来名称：</span>{{item.dealerName || '无'}}
                      </div>
                    </div>
                  </div>
                  <div class="classification-split"></div>
                  <div class="bank-name">{{item.account}}</div>
                  <div class="bank-info">
                    <div class="flow-info">
                      <div class="flow_info_item">
                        <span class="title">开户银行：</span>{{item.bank || '暂无银行信息'}}
                      </div>
                      <div class="flow_info_item">
                        <span class="title">资金账户名称：</span>{{item.fundName}}
                      </div>
                      <div class="flow_info_item">
                        <div class="flow_account_item">
                          <span class="title">账户编码：</span>{{item.cashCode}}
                        </div>
                      </div>
                      <div class="flow_info_item">
                          <span class="title">账户大类：</span>{{item.accountSub}}
                      </div>
                      <div class="flow_info_item">
                        <span class="title">现金流类型：</span>{{item.cashType}}
                      </div>
                      <div class="flow_info_item">
                        <span class="title">现金流项目：</span>{{item.cashFlow}}
                      </div>
                    </div>
                    <div class="bank_amt_wrapper">
                      <!-- 付款：crAmt，收款：drAmt -->
                      <div class="bank_amt">￥{{item.crAmnt || item.drAmnt | numberComma}}
                      </div>
                    </div>
                  </div>
                </div>
              </template>
              <!-- 资金账户余额 -->
              <template v-else-if="key === 'view_48'">
                <div class="bank-item-wrapper" :class="{bg2: index % 3 === 2, bg3: index % 3 === 0}"
                     v-for='(item, index) in slide.listData' :key='index' @click="getFlow(item)">
                  <div class="bank-header-wrapper">
                    <img class="bank_icon" :src="item.icon">
                    <div class="bank_info">
                      <div class="bank">{{item.bank}}</div>
                      <div class="bank_name">{{item.fundName}}</div>
                    </div>
                    <div class="bank_code">{{item.cashCode}}</div>
                  </div>
                  <div class="bank-balance-wrapper">
                    <div class="bank-balance">{{item.amountBalance | numberComma}}</div>
                    <div class="text">余额<span>（{{item.fundCurrency}}）</span></div>
                  </div>
                </div>
              </template>
              <!-- 现金流计划表 -->
              <template v-else-if="key === 'view_140'">
                <div class="schedule-item-wrapper" 
                  v-for='(item, index) in slide.listData'
                  @click="goInstanceDetail(item)" 
                  :key='index'>
                  <div class="schedule-main">
                    <img class="schedule_img" :src="item.appIcon">
                    <div class="schedule_info">
                      <div class="app_name">{{item.appTitle}}</div>
                      <div class="schedule_info_item">
                        <span class="schedule_info_title">实例编码：</span>{{item.transCode}}
                      </div>
                      <div class="schedule_info_item">
                        <span class="schedule_info_title">到账截止日期：</span>{{item.draftDueDate
                        || '无'}}
                      </div>
                    </div>
                  </div>
                  <div class="schedule-split"></div>
                  <div class="dealer-name">{{item.dealerName}}</div>
                  <div class="schedule_dealer">
                    <div>
                      <div class="schedule_dealer_item">
                        <span class="schedule_dealer_title">往来编码：</span>{{item.dealerCode}}
                      </div>
                      <div class="schedule_dealer_item">
                        <span class="schedule_dealer_title">关系标签：</span>{{item.accountSub}}
                      </div>
                      <div class="schedule_dealer_item">
                        <span class="schedule_dealer_title">剩余天数：</span>{{item.paymentSurplusDays || 0}}
                      </div>
                    </div>
                    <div>
                      <div class="bank_amt_wrapper">
                      <div class="bank_amt">￥{{item.amntBalance | numberComma}}</div>
                    </div>
                    </div>
                  </div>
                </div>
              </template>
              <!-- 其他视图  -->
              <template v-else>
                <div class='each_duty' v-for='(item, index) in listData' :key='index' @click="getFlow(item)">
                  <div class="duty_top">
                    <div class="basic_info">
                  <span class="warehouse warehouse_name">
                    <!-- 账户编码 -->
                    账户编码
                  </span>
                      <!-- 编码 -->
                      <span class="warehouse warehouse_code">{{item.cashCode}}</span>
                    </div>
                  </div>
                  <!-- 资金账户名称 -->
                  <div class='matter'>
                    <div class='matter_name'>{{item.fundName}}</div>
                  </div>
                  <div class='duty_btm vux-1px-t'>
                    <!-- 开户银行 -->
                    <div class="ware_type">
                      {{item.bank || '暂无银行信息'}}
                    </div>
                    <!-- 余额 -->
                    <div class="balance" v-if="item.amountBalance !== ''">
                      {{item.amountBalance | numberComma}}
                    </div>
                  </div>
                </div>
              </template>
            </r-scroll>
          </div>
        </div>
      </div>
      <!-- 展开状态 -->
      <div v-transfer-dom>
        <popup v-model="flowShow" position="bottom" height="80%">
          <r-scroll class="flow_list_wrapper" ref="flowListWrapper"
                    :options="FlowScrollOptions" :has-next="FlowHasNext"
                    :no-data="!FlowHasNext && !flowData.length" @on-pulling-up="onPullingUpFlow">
            <div class="flow">
              <div class='flow_top'>
                <div class="title">流水详情</div>
              </div>
              <div class="flow_list">
                <div class='each_flow' v-for='(Fitem,Findex) in flowData' :key="Findex"
                     @click.stop="goInstanceDetail(Fitem)">
                  <!--展开状态-->
                  <div class="duty_top">
                    <!-- 编码 -->
                    <div class='transCode'>
                      <span class="order_title">编码</span>
                      <span class="order_num">{{Fitem.transCode}}</span>
                    </div>
                    <!-- 时间 -->
                    <div class="time">
                      {{Fitem.calcTime}}
                    </div>
                  </div>
                  <!-- 金额 -->
                  <div class='show_list'>
                    <!-- 应用名称 -->
                    <div class="app_name">
                      {{Fitem.appTitle}}<span class="symbol">[应用]</span>
                    </div>
                    <div class="num_info">
                      <!-- 借方金额 -->
                      <div class="amount_money">
                        <div class="num_part" v-if="Fitem.drAmnt>0">
                          <span class="symbol">借方金额: </span>
                          <span class="number_incre">{{Fitem.drAmnt | toFixed}}</span>
                        </div>
                        <div class="num_part" v-else-if="Fitem.drAmnt<0">
                          <span class="symbol">借方金额: </span>
                          <span class="number_redu">{{Fitem.drAmnt | toFixed}}</span>
                        </div>
                        <div class="num_part" v-else>
                          <span class="symbol">借方金额: </span>
                          <span>0</span>
                        </div>
                      </div>
                      <!-- 贷方金额 -->
                      <div class="amount_money">
                        <div class="num_part" v-if="Fitem.crAmnt>0">
                          <span class="symbol">贷方金额: </span>
                          <span class="number_incre">{{Fitem.crAmnt | toFixed}}</span>
                        </div>
                        <div class="num_part" v-else-if="Fitem.crAmnt<0">
                          <span class="symbol">贷方金额: </span>
                          <span class="number_redu">{{Fitem.crAmnt | toFixed}}</span>
                        </div>
                        <div class="num_part" v-else>
                          <span class="symbol">贷方金额: </span>
                          <span>&nbsp;0</span>
                        </div>
                      </div>
                      <!-- 记账日期与时间 -->
                      <div class="amount_time">
                        <span class="title">记账日期与时间: </span>
                        <span>{{Fitem.effectiveTime}}</span>
                      </div>
                    </div>
                  </div>
                  <!-- 金额余额 -->
                  <div class="summary_part vux-1px-t">
                    <div class="number"></div>
                    <div class="price HBZJ_total">
                      <span class="symbol">当前余额:</span>
                      <span :class="{increase: Fitem.amountBalance > 0,reduce: Fitem.amountBalance < 0}">
                        {{Fitem.amountBalance | toFixed | numberComma}}
                      </span>
                    </div>
                  </div>
                </div>
                <div>
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
  import listCommon from 'mixins/kmListCommon'
  import {getListClassfiy, getViewList} from 'service/kmService'
  import {toFixed} from '@/plugins/calc'
  import { dateFormat } from 'vux'

  const BASE_PARAMS = {
    page: 1,
    limit: 20,
    hasNext: true,
    listData: [],
  };
  export default {
    data() {
      return {
        uniqueId: 1000,
        showContent: false,
        filterArr: [
          {"operator": "like", "value": "", "property": "cashCode"}
        ],
        listMap: {},
      }
    },
    computed: {
      // 当前滑块
      currentItem() {
        if(this.listView.length){
          let {view_id} = this.listView[this.activeIndex];
          return this.listMap[view_id];
        }
      },
      // 当前滚动容器
      currentScroll() {
        return this.$refs.bScroll[this.activeIndex]
      },
      // 搜索提示文字
      tipsWord() {
        let currentView = this.view_id;
        let viewList = {
          view_48: '账户名称/编码/银行/余额', 
          view_49: '应用名称/实例编码/往来名称/银行/', 
          view_140: '应用名称/实例编码/往来编码/往来名称'
        };
        if (viewList.hasOwnProperty(currentView)) return viewList[currentView];
      }
    },
    mixins: [listCommon],
    methods: {
      goInstanceDetail(item) {
        this.$router.push({
          path: `/detail/${item.listId}/0`,
          query: {
            name: item.appTitle, 
            folder: 'finance',
            fileName: 'null',
            transCode: item.transCode
          }
        })
      },
      // 重置列表条件
      resetCondition() {
        if(this.listView.length){
          let view_id = this.listView[this.activeIndex] && this.listView[this.activeIndex]['view_id'];
          this.listMap[view_id] = {...BASE_PARAMS};
          this.currentScroll.scrollTo(0, 0);
          this.currentScroll.resetPullDown();
        }
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
          this.getView();
          this.getListData();
          this.initSwiper();
          this.$nextTick(() => {
            this.listSwiper.update();
          })
        })
      },
      //获取列表数据
      getListData(noReset = false) {
        if(this.currentItem){
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
            item.draftDueDate && (item.draftDueDate = dateFormat(item.draftDueDate,'YYYY-MM-DD'));
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
              item.appIcon = item.appIcon || 'https://lab.roletask.com/resource/app-icon/payment-of-supplier-arrears.png';
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
        }
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
                this.resetCondition();
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
    filters: {toFixed},
    created() {
      
    }
  }
</script>

<style lang='scss' scoped>
  @import '~scss/subject/subList';

  .HBZJ_total {
    .number_incre {
      color: #c93d1b;
    }
    .number_redu {
      color: #53d397;
    }
  }

  .list-container {
    height: calc(100% - .96rem);
    .list_wrapper {
      height: 100%;
      background-color: #fff;
    }
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

  /* 资金账户余额 */
  .bank-item-wrapper {
    position: relative;
    margin: .1rem .13rem;
    padding: .2rem .31rem .28rem .38rem;
    width: calc(100% - .26rem);
    background: url(~assets/bg/bg-bank.png) no-repeat;
    background-size: 100% 100%;
    color: #fff;
    box-sizing: border-box;
    &.bg2 {
      background-image: url(~assets/bg/bg-bank2.png);
    }
    &.bg3 {
      background-image: url(~assets/bg/bg-bank3.png);
    }
    .bank-header-wrapper {
      display: flex;
      justify-content: space-between;
      align-items: center;
      .bank_icon {
        /*width: .22rem;*/
        height: .22rem;
      }
      .bank_info {
        flex: 1;
        margin-left: .12rem;
      }
      .bank {
        line-height: .14rem;
        font-size: .15rem;
      }
      .bank_name {
        margin-top: .05rem;
        line-height: .14rem;
        color: #F6FBFE;
        font-size: .12rem;
      }
      .bank_code {
        padding: .04rem .06rem;
        line-height: .12rem;
        border-radius: .1rem;
        background-color: rgba(255, 255, 255, .3);
        font-size: .12rem;
      }
    }
    .bank-balance-wrapper {
      margin: .3rem 0 0 .3rem;
      .bank-balance {
        line-height: .36rem;
        font-size: .36rem;
        font-weight: bold;
      }
      .text {
        margin-top: .1rem;
        line-height: .12rem;
        color: #F9F9F9;
        font-size: .12rem;
      }
    }
  }

  /* 现金流分类识别 */
  .classification-item-wrapper {
    margin: .1rem;
    padding: .2rem .15rem .13rem;
    width: calc(100% - .2rem);
    border-radius: 4px;
    color: #333;
    box-sizing: border-box;
    box-shadow: 0 2px 10px 0 rgba(0, 0, 0, 0.1);
    .bank-name {
      margin: .18rem 0 0;
      line-height: .18rem;
      font-size: .145rem;
      font-weight: 700;
    }
    .classification-header-wrapper {
      display: flex;
      .classification_img {
        width: .5rem;
        height: .5rem;
        border-radius: .04rem;
      }
      .classification_app {
        flex: 1;
        margin-left: .12rem;
      }
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

    .bank-info {
      display: flex;
      justify-content: space-between;
      .bank {
        line-height: .18rem;
        font-size: .12rem;
        .title {
          color: #999;
        }
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
      .bank_account {
        margin-top: .07rem;
        line-height: .12rem;
        font-size: .12rem;
        .title {
          color: #696969;
        }
      }
      .bank_amt_wrapper {
        text-align: center;
      }
      .bank_amt {
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
  }

  /* 现金流计划表 */
  .schedule-item-wrapper {
    position: relative;
    margin: .1rem;
    padding: .2rem .15rem;
    width: calc(100% - .2rem);
    border-radius: 4px;
    color: #333;
    box-sizing: border-box;
    box-shadow: 0 2px 10px 0 rgba(0, 0, 0, 0.1);

    .schedule-main {
      display: flex;
      .schedule_img {
        width: .5rem;
        height: .5rem;
        border-radius: .04rem;
      }
      .schedule_info {
        margin-left: .12rem;
        line-height: .12rem;
        font-size: .12rem;
      }
      .app_name {
        line-height: .18rem;
        font-size: .14rem;
        font-weight: 600;
      }
      .schedule_info_item {
        margin-top: .12rem;
        & + .schedule_info_item {
          margin-top: .08rem;
        }
      }
      .schedule_info_title {
        color: #999;
      }
    }

    .schedule_dealer{
      line-height: .12rem;
      font-size: .12rem;
      display: flex;
      justify-content: space-between;
      .schedule_dealer_item {
        margin-top: .12rem;
        & + .schedule_dealer_item {
          margin-top: .08rem;
        }
      }
      .schedule_dealer_title {
        color: #999;
      }
      .bank_amt_wrapper {
        text-align: center;
      }
      .bank_amt {
        line-height: .17rem;
        color: #FA7138;
        font-size: .18rem;
        font-weight: 600;
      }
    }

    .dealer-name {
      margin: .18rem 0 0;
      line-height: .18rem;
      font-size: .14rem;
      font-weight: 600;
    }

    .schedule-split {
      position: relative;
      margin: .2rem 0 .13rem;
      height: 1px;
      border-top: 1px dashed #DEDFE6;
    }

    .schedule-bottom {
      font-size: .12rem;
      text-align: center;
      position: relative;
      line-height: .12rem;
      .schedule_bottom_item {
        &.days, &.amt {
          position: absolute;
        }
        &.days {
          left: 0;
        }
        &.amt {
          top: -1px;
          right: 0;
          color: #FA7138;
          .schedule_bottom_value {
            font-weight: bold;
            font-size: .16rem;
          }
        }
      }
      .schedule_bottom_value {
        font-size: .14rem;
      }
      .schedule_bottom_title {
        margin-top: .08rem;
        color: #999;
      }
      .symbol {
        font-size: .12rem;
      }
    }
  }
</style>
