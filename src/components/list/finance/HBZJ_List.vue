<template>
  <div class="pages" ref='list'>
    <div class='content'>
      <div class="list_top">
        <!-- 搜索栏 -->
        <searchIcon @search='searchList'></searchIcon>
        <!--<div class="tab-container">
          <div class="tab-item" :class="{active: index === activeIndex}" v-for="(item, index) in listView"
               @click="tabClick(item, index)">
            {{item.view_name}}
          </div>
        </div>-->
        <div class="filter_part">
          <tab :line-width='0' default-color='#333' active-color='#3296FA'>
            <tab-item v-for="(item, index) in listView" :key="index" :selected="index === activeIndex"
                      @on-item-click="tabClick(item, index)">{{item.view_name}}
            </tab-item>
          </tab>
        </div>
      </div>
      <!--<div class="swiper-container list-container">
        <div class="swiper-wrapper">
          <r-scroll class="swiper-slide list_wrapper" :options="scrollOptions" :has-next="hasNext"
                    :no-data="!hasNext && !listData.length" @on-pulling-up="onPullingUp"
                    @on-pulling-down="onPullingDown"
                    ref="bScroll">
            &lt;!&ndash; 现金流分类识别 专属dom结构 &ndash;&gt;
            <template v-if="activeTab.includes('现金流分类')">
              <div class="classification-item-wrapper" v-for='(item, index) in listData' :key='index'>
                <div class="classification-header-wrapper">
                  <img class="classification_img" :src="item.AppIcon" alt="app-icon">
                  <div class="classification_app">
                    <div class="app_top">
                      <div class="app_name">{{item.appTitle}}</div>
                      <div class="app_flow" :class="item.flowWordClass">
                        {{item.cashInOrOut}}<i :class="item.flowIconClass"></i>
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
                <div class="bank-info">
                  <div class="bank_detail">
                    <div class="bank">
                      <span class="title">开户银行: </span>{{item.bank || '暂无银行信息'}}
                    </div>
                    <div class="bank_account">
                      <span class="title">银行账号: </span>{{item.account || '无'}}
                    </div>
                  </div>
                  <div class="bank_amt_wrapper">
                    &lt;!&ndash; 付款：crAmt，收款：drAmt &ndash;&gt;
                    <div class="bank_amt"><span class="symbol">￥</span>{{item.crAmnt || item.drAmnt | numberComma}}</div>
                    <div class="text">总{{item.transName}}({{item.fundCurrency}})</div>
                  </div>
                </div>
                <div class="bank-name">{{item.fundName}}</div>
                <div class="flow-info">
                  <div class="flow_info_item">
                    <div class="flow_account_item">
                      <span class="title">账户编码：</span>{{item.cashCode}}
                    </div>
                    <div class="flow_account_item flow_account_sub">
                      <span class="title">账户大类：</span>{{item.accountSub}}
                    </div>
                  </div>
                  <div class="flow_info_item">
                    <span class="title">现金流类型：</span>{{item.cashType}}
                  </div>
                  <div class="flow_info_item">
                    <span class="title">现金流项目：</span>{{item.cashFlow}}
                  </div>
                </div>
              </div>
            </template>
            &lt;!&ndash; 资金账户余额 &ndash;&gt;
            <template v-else-if="activeTab.includes('资金账户余额')">
              <div class="bank-item-wrapper" :class="{bg2: index % 3 === 2, bg3: index % 3 === 0}"
                   v-for='(item, index) in listData' :key='index' @click="getFlow(item)">
                <div class="bank-header-wrapper">
                  <img class="bank_icon" :src="item.icon" alt="bank-icon">
                  <div class="bank_info">
                    <div class="bank">{{item.bank}}</div>
                    <div class="bank_name">{{item.fundName}}</div>
                  </div>
                  <div class="bank_code">{{item.cashCode}}</div>
                </div>
                <div class="bank-balance-wrapper">
                  <div class="bank-balance">{{item.amountBalance | numberComma}}</div>
                  <div class="text">余额</div>
                </div>
              </div>
            </template>
            &lt;!&ndash; 现金流计划表 &ndash;&gt;
            <template v-else-if="activeTab.includes('现金流计划表')">
              <div class="schedule-item-wrapper" v-for='(item, index) in listData' :key='index' @click="getFlow(item)">
                <div class="schedule-main">
                  <img class="schedule_img" :src="item.appIcon" alt="app-icon">
                  <div class="schedule_info">
                    <div class="app_name">{{item.appTitle}}</div>
                    <div class="schedule_info_item">
                      <span class="schedule_info_title">实例编码：</span>{{item.transCode}}
                    </div>
                    <div class="schedule_info_item">
                      <span class="schedule_info_title">往来编码：</span>{{item.dealerCode}}
                    </div>
                    <div class="schedule_info_item">
                      <span class="schedule_info_title">关系标签：</span>{{item.crDealerLabel}}
                    </div>
                    <div class="schedule_info_item">
                      <span class="schedule_info_title">往来名称：</span>{{item.dealerName}}
                    </div>
                    <div class="schedule_info_item">
                      <span class="schedule_info_title">到账截止日期：</span>{{item.draftDueDate | dateFormat('YYYY-MM-DD') ||
                      '无'}}
                    </div>
                  </div>
                </div>
                <div class="schedule-split"></div>
                <div class="schedule-bottom">
                  <div class="schedule_bottom_item">
                    <div class="schedule_bottom_value">{{item.paymentSurplusDays || 0}}</div>
                    <div class="schedule_bottom_title">剩余天数</div>
                  </div>
                  <div class="schedule_bottom_item">
                    <div class="schedule_bottom_value">{{item.transName}}</div>
                    <div class="schedule_bottom_title">计划类型</div>
                  </div>
                  <div class="schedule_bottom_item amt">
                    <div class="schedule_bottom_value">
                      <span class="symbol">￥</span>{{item.amntBalance | numberComma}}
                    </div>
                    <div class="schedule_bottom_title">金额</div>
                  </div>
                </div>
              </div>
            </template>
            &lt;!&ndash; 其他视图  &ndash;&gt;
            <template v-else>
              <div class='each_duty' v-for='(item, index) in listData' :key='index' @click="getFlow(item)">
                <div class="duty_top">
                  <div class="basic_info">
                  <span class="warehouse warehouse_name">
                    &lt;!&ndash; 账户编码 &ndash;&gt;
                    账户编码
                  </span>
                    &lt;!&ndash; 编码 &ndash;&gt;
                    <span class="warehouse warehouse_code">{{item.cashCode}}</span>
                  </div>
                </div>
                &lt;!&ndash; 资金账户名称 &ndash;&gt;
                <div class='matter'>
                  <div class='matter_name'>{{item.fundName}}</div>
                </div>
                <div class='duty_btm vux-1px-t'>
                  &lt;!&ndash; 开户银行 &ndash;&gt;
                  <div class="ware_type">
                    {{item.bank || '暂无银行信息'}}
                  </div>
                  &lt;!&ndash; 余额 &ndash;&gt;
                  <div class="balance" v-if="item.amountBalance !== ''">
                    <span class="symbol">余额: ￥</span>{{item.amountBalance | numberComma}}
                  </div>
                </div>
              </div>
            </template>
          </r-scroll>
        </div>
      </div>-->

      <r-scroll class="list_wrapper" :options="scrollOptions" :has-next="hasNext"
                :no-data="!hasNext && !listData.length" @on-pulling-up="onPullingUp"
                @on-pulling-down="onPullingDown"
                ref="bScroll">
        <!-- 现金流分类识别 专属dom结构 -->
        <template v-if="activeTab.includes('现金流分类')">
          <div class="classification-item-wrapper" v-for='(item, index) in listData' :key='index'>
            <div class="classification-header-wrapper">
              <img class="classification_img" :src="item.AppIcon" alt="app-icon">
              <div class="classification_app">
                <div class="app_top">
                  <div class="app_name">{{item.appTitle}}</div>
                  <div class="app_flow" :class="item.flowWordClass">
                    {{item.cashInOrOut}}<i :class="item.flowIconClass"></i>
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
            <div class="bank-info">
              <div class="bank_detail">
                <div class="bank">
                  <span class="title">开户银行: </span>{{item.bank || '暂无银行信息'}}
                </div>
                <div class="bank_account">
                  <span class="title">银行账号: </span>{{item.account || '无'}}
                </div>
              </div>
              <div class="bank_amt_wrapper">
                <!-- 付款：crAmt，收款：drAmt -->
                <div class="bank_amt"><span class="symbol">￥</span>{{item.crAmnt || item.drAmnt | numberComma}}</div>
                <div class="text">总{{item.transName}}({{item.fundCurrency}})</div>
              </div>
            </div>
            <div class="bank-name">{{item.fundName}}</div>
            <div class="flow-info">
              <div class="flow_info_item">
                <div class="flow_account_item">
                  <span class="title">账户编码：</span>{{item.cashCode}}
                </div>
                <div class="flow_account_item flow_account_sub">
                  <span class="title">账户大类：</span>{{item.accountSub}}
                </div>
              </div>
              <div class="flow_info_item">
                <span class="title">现金流类型：</span>{{item.cashType}}
              </div>
              <div class="flow_info_item">
                <span class="title">现金流项目：</span>{{item.cashFlow}}
              </div>
            </div>
          </div>
        </template>
        <!-- 资金账户余额 -->
        <template v-else-if="activeTab.includes('资金账户余额')">
          <div class="bank-item-wrapper" :class="{bg2: index % 3 === 2, bg3: index % 3 === 0}"
               v-for='(item, index) in listData' :key='index' @click="getFlow(item)">
            <div class="bank-header-wrapper">
              <img class="bank_icon" :src="item.icon" alt="bank-icon">
              <div class="bank_info">
                <div class="bank">{{item.bank}}</div>
                <div class="bank_name">{{item.fundName}}</div>
              </div>
              <div class="bank_code">{{item.cashCode}}</div>
            </div>
            <div class="bank-balance-wrapper">
              <div class="bank-balance">{{item.amountBalance | numberComma}}</div>
              <div class="text">余额</div>
            </div>
          </div>
        </template>
        <!-- 现金流计划表 -->
        <template v-else-if="activeTab.includes('现金流计划表')">
          <div class="schedule-item-wrapper" v-for='(item, index) in listData' :key='index' @click="getFlow(item)">
            <div class="schedule-main">
              <img class="schedule_img" :src="item.appIcon" alt="app-icon">
              <div class="schedule_info">
                <div class="app_name">{{item.appTitle}}</div>
                <div class="schedule_info_item">
                  <span class="schedule_info_title">实例编码：</span>{{item.transCode}}
                </div>
                <div class="schedule_info_item">
                  <span class="schedule_info_title">往来编码：</span>{{item.dealerCode}}
                </div>
                <div class="schedule_info_item">
                  <span class="schedule_info_title">关系标签：</span>{{item.crDealerLabel}}
                </div>
                <div class="schedule_info_item">
                  <span class="schedule_info_title">往来名称：</span>{{item.dealerName}}
                </div>
                <div class="schedule_info_item">
                  <span class="schedule_info_title">到账截止日期：</span>{{item.draftDueDate | dateFormat('YYYY-MM-DD') ||
                  '无'}}
                </div>
              </div>
            </div>
            <div class="schedule-split"></div>
            <div class="schedule-bottom">
              <div class="schedule_bottom_item">
                <div class="schedule_bottom_value">{{item.paymentSurplusDays || 0}}</div>
                <div class="schedule_bottom_title">剩余天数</div>
              </div>
              <div class="schedule_bottom_item">
                <div class="schedule_bottom_value">{{item.transName}}</div>
                <div class="schedule_bottom_title">计划类型</div>
              </div>
              <div class="schedule_bottom_item amt">
                <div class="schedule_bottom_value">
                  <span class="symbol">￥</span>{{item.amntBalance | numberComma}}
                </div>
                <div class="schedule_bottom_title">金额</div>
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
                <span class="symbol">余额: ￥</span>{{item.amountBalance | numberComma}}
              </div>
            </div>
          </div>
        </template>
      </r-scroll>

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
                     @click.stop="Fitem.showList = !Fitem.showList">
                  <!--展开状态-->
                  <div class="duty_top">
                    <!-- 编码 -->
                    <div class='transCode'>
                      <span class="order_title">编码</span>
                      <span class="order_num">{{Fitem.transCode}}</span>
                    </div>
                    <!-- 时间 -->
                    <div class="time">
                      {{Fitem.calcTime | dateFormat}}
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
                          <span class="number_incre">+ {{Fitem.drAmnt | toFixed}}</span>
                        </div>
                        <div class="num_part" v-else-if="Fitem.drAmnt<0">
                          <span class="symbol">借方金额: </span>
                          <span class="number_redu">- {{Fitem.drAmnt | toFixed}}</span>
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
                          <span class="number_incre">+ {{Fitem.crAmnt | toFixed}}</span>
                        </div>
                        <div class="num_part" v-else-if="Fitem.crAmnt<0">
                          <span class="symbol">贷方金额: </span>
                          <span class="number_redu">- {{Fitem.crAmnt | toFixed}}</span>
                        </div>
                        <div class="num_part" v-else>
                          <span class="symbol">贷方金额: </span>
                          <span>0</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <!-- 金额余额 -->
                  <div class="summary_part vux-1px-t">
                    <div class="number"></div>
                    <div class="price HBZJ_total">
                      <span class="symbol">当前余额:</span>
                      <span :class="{increase: Fitem.amountBalance > 0,reduce: Fitem.amountBalance < 0}">
                        ￥{{Fitem.amountBalance | toFixed | numberComma}}
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
  import listCommon from 'pageMixins/kmListCommon'
  import {toFixed} from '@/plugins/calc'

  export default {
    data() {
      return {
        uniqueId: 1000,
        showContent: false,
        filterArr: [
          {"operator": "like", "value": "", "property": "cashCode"}
        ],
      }
    },
    mixins: [listCommon],
    methods: {
      // TODO 初始化swiper
      initSwiper() {
        this.$nextTick(() => {
          this.pageSwiper = new this.Swiper('.list-container', {
            touchAngle: 30,
            on: {
              slideChangeTransitionStart: () => {
                /*let index = this.pageSwiper.activeIndex;
                let list = [this.getList, this.getComment, this.getPraise];
                let {status} = this.tabList[index];
                this.activeIndex = index;
                this.isMovingSwiper = true;
                // 已有数据则不重新请求
                if (Object.keys(this.currentItem.listData).length) {
                  return
                }
                this.resetCondition();
                list[this.activeIndex]();*/
              },
              slideChangeTransitionEnd: () => {
                // this.isMovingSwiper = false;
              }
            },
          });
        })
      },
    },
    filters: {toFixed},
    created() {
      // this.initSwiper();
    }
  }
</script>

<style lang='scss' scoped>
  @import './../../scss/SUB/subList';

  .HBZJ_total {
    .number_incre {
      color: #c93d1b;
    }
    .number_redu {
      color: #53d397;
    }
  }

  /*.list-container {
    height: calc(100% - .96rem);
    .list_wrapper {
      height: 100%;
      background-color: #fff;
    }
  }*/

  .list_wrapper {
    height: calc(100% - .98rem);
    background-color: #fff;
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
    margin: 0 .13rem .1rem;
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
      &:before, &:after {
        content: '';
        position: absolute;
        top: 50%;
        z-index: 1;
        width: .1rem;
        height: .2rem;
        background-color: transparent;
        transform: translate(0, -50%);
        /*box-shadow: inset 0 0 10px 0 rgba(0, 0, 0, 0.1);*/
      }
      &:before {
        left: -.15rem;
        border-radius: 0 .1rem .1rem 0;
      }
      &:after {
        right: -.15rem;
        border-radius: .1rem 0 0 .1rem;
      }
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

    .bank-name {
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

  /* 现金流计划表 */
  .schedule-item-wrapper {
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

    .schedule-split {
      position: relative;
      margin: .2rem 0 .13rem;
      height: 1px;
      border-top: 1px dashed #DEDFE6;
    }

    .schedule-bottom {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      line-height: .12rem;
      font-size: .12rem;
      text-align: center;
      .schedule_bottom_item {
        &.amt {
          color: #FA7138;
          .schedule_bottom_value {
            line-height: .17rem;
            font-weight: 600;
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
