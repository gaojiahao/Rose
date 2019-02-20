<template>
  <div class="pages" ref="list">
    <div class="content">
      <div class="list_top">
        <!-- 搜索栏 -->
        <searchIcon @search="searchList"></searchIcon>
        <div class="filter_part">
          <tab-item :tabVal='listView' @tab-click="tabClick"></tab-item>
        </div>
      </div>
      <!-- 列表 -->
      <r-scroll class="list_wrapper" :options="scrollOptions" :has-next="hasNext"
                :no-data="!hasNext && !listData.length" @on-pulling-up="onPullingUp" @on-pulling-down="onPullingDown"
                ref="bScroll">
        <template v-if="activeTab.includes('核销')">
          <div class="verification-item-wrapper" v-for='(item, index) in listData' :key='index'>
            <div class="verification-header-wrapper">
              <img class="verification_img" :src="item.appIcon" alt="icon">
              <div class="verification_app">
                <div class="app_top">
                  <div class="app_name">{{item.appTitle}}</div>
                  <div class="app_flow" :class="item.flowWordClass">
                    {{item.cashInOrOut}}<i :class="item.flowIconClass"></i>
                  </div>
                </div>
                <div class="verification_detail_item">
                  <span class="verification_detail_title">实例编码：</span>{{item.transCode}}
                </div>
                <div class="verification_detail_item">
                  <span class="verification_detail_title">往来名称：</span>{{item.dealerName || '无'}}
                </div>
              </div>
            </div>
            <div class="verification-split"></div>
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
                <div class="bank_amt">{{item.crAmnt || item.drAmnt | numberComma}}
                </div>
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
                <span class="symbol">余额: </span>{{item.amountBalance| toFixed | numberComma}}
              </div>
            </div>
          </div>
        </template>
      </r-scroll>

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
import TabItem from 'components/tab'
import listCommon from 'pageMixins/kmListCommon'
import { toFixed } from '@/plugins/calc'
export default {
  data() {
    return {
      uniqueId: 9000,
      showContent: false,
      handleLoadding: false,
      filterArr: [
        {operator: 'like', value: '', property: 'dealerCode'}
      ],
    }
  },
  components:{
    TabItem
  },
  mixins: [listCommon],
  filters: { toFixed }
}
</script>

<style lang='scss' scoped>
  @import './../../scss/SUB/subList';
  .verification-item-wrapper {
    color: #333;
    margin: .1rem;
    background: #FFF;
    border-radius: 4px;
    box-sizing: border-box;
    width: calc(100% - .2rem);
    padding: .2rem .15rem .13rem;
    box-shadow: 0 2px 10px 0 rgba(0, 0, 0, 0.1);
    .verification-header-wrapper {
      display: flex;
      .verification_img {
        width: .5rem;
        height: .5rem;
        border-radius: .04rem;
      }
      .verification_app {
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

      .verification_detail_item {
        margin-top: .1rem;
        line-height: .12rem;
        font-size: .12rem;
        & + .verification_detail_item {
          margin-top: .08rem;
        }
      }
      .verification_detail_title {
        color: #696969;
      }
    }

    /* 分割线 */
    .verification-split {
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
  
</style>
