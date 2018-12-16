<template>
  <div class="pages" ref='list'>
    <div class='content'>
      <div class="list_top">
        <!-- 搜索栏 -->
        <searchIcon @search='searchList'></searchIcon>
        <div class="filter_part">
          <tab :line-width='2' default-color='#757575' active-color='#2c2727'>
            <tab-item v-for="(item, index) in listView" :key="index" :selected="index === activeIndex"
                      @on-item-click="tabClick(item, index)">{{item.view_name}}
            </tab-item>
          </tab>
        </div>
      </div>
      <r-scroll class="list_wrapper" :options="scrollOptions" :has-next="hasNext"
                :no-data="!hasNext && !listData.length" @on-pulling-up="onPullingUp" @on-pulling-down="onPullingDown"
                ref="bScroll">
        <!-- 现金流分类识别 专属dom结构 -->
        <template v-if="activeTab.includes('现金流分类')">
          <div class='each_duty' v-for='(item, index) in listData' :key='index' @click="getFlow(item)">
            <div class="duty_top">
                <div class="basic_info">
                  <img :src="item.AppIcon"/>
                  <div class="app_info_container">
                    <span>{{item.appTitle}}</span>
                    <span class="other_info_with">实例编码: {{item.transCode}}</span>
                    <span class="other_info_with">往来名称: {{item.dealerName}}</span>
                  </div>
                </div>
                <div class="cash_flow_status" :class="item.flowWordClass">
                  <span>{{item.cashInOrOut}}</span>
                  <span :class="item.flowIconClass"></span>
                </div>
            </div>
            <div class="common_info_part">
            </div>
            <!-- 资金账户名称 -->
            <div class="main_content">
              <div class="fund_part">
                <div class='matter_name'>{{item.fundName}}</div>
                <p class="matter_type">账户编码: {{item.cashCode}}</p>
                <p class="matter_type">资金账户大类: {{item.accountSub}}</p>
              </div>
              <div class="other_part">
                <p class="matter_type">现金流类型: {{item.cashType}}</p>
                <p class="matter_type">现金流项目: {{item.cashFlow}}</p>
              </div>
            </div>
            
            <div class='duty_btm vux-1px-t'>
              <!-- 开户银行 -->
              <div class="ware_type">
                <p>{{item.bank || '暂无银行信息'}}<span class="symbol" v-if="item.bank">[开户银行]</span></p>
                <p class="symbol type_with_num" v-if="item.bank">账号: {{item.account}}</p>
              </div>
              <!-- 付款金额 -->
              <div class="pay_num_part">
                <p v-if="item.crAmnt" >
                  <span class="symbol">付款金额: ￥</span>
                  <span>{{item.crAmnt | numberComma}}</span>
                </p>
                <p v-if="item.drAmnt" >
                  <span class="symbol">收款金额: ￥</span>
                  <span>{{item.drAmnt | numberComma}}</span>
                </p>
                <span class="symbol other_pay_status">币种: 人民币</span>
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
                <div class='each_flow' v-for='(Fitem,Findex) in flowData' :key="Findex" @click.stop="Fitem.showList = !Fitem.showList">
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
                          <span class="symbol" >借方金额: </span>
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
import { toFixed } from '@/plugins/calc'
export default {
  data() {
    return {
      uniqueId : 1000,
      showContent : false,
      filterArr: [
        {"operator":"like","value":"","property":"cashCode"}
      ],
    }
  },
  mixins: [listCommon],
  filters: { toFixed }
}
</script>

<style lang='scss' scoped>
  @import './../../scss/SUB/subList';
  .HBZJ_total{
      .number_incre{
          color: #c93d1b;
      }
      .number_redu{
          color: #53d397;
      }
  }
</style>
