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
  .list_wrapper {
    height: calc(100% - 1rem);
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
</style>
