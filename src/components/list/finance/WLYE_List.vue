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
      <r-scroll class="list_wrapper" :options="scrollOptions" :has-next="hasNext"
                :no-data="!hasNext && !listData.length" @on-pulling-up="onPullingUp" @on-pulling-down="onPullingDown"
                ref="bScroll">
        <div class="each_duty" v-for="(item,index) in listData" :key="index" @click="getFlow(item)">
          <div class="duty_top">
            <!-- 表单状态 及 编码 -->
            <div class="warehouse_info">
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
              <span class="title">帐龄天数</span>
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
              <span class="symbol">余额: ￥</span>{{item.amountBalance}}
            </div>
          </div>
        </div>
      </r-scroll>

      <!-- 展开状态 -->
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
                            <span class="symbol">￥</span>{{Fitem.drAmnt}}
                          </span>
                          <!-- <span class="number_redu" v-else-if="Fitem.drAmnt < 0">- {{Fitem.drAmnt.toFixed(2)}}</span> -->
                          <span v-else>0</span>
                        </div>
                      </div>
                      <!-- 金额 -->
                      <div class="amount_money">
                        <div class="num_part">
                          <span class="symbol">贷方金额: </span>
                          <span class="number_incre" v-if="Fitem.crAmnt > 0">
                            <span class="symbol">￥</span>{{Fitem.crAmnt}}
                          </span>
                          <span v-else>0</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="summary_part vux-1px-t">
                    <div class="number"></div>
                    <div class="price">
                      <span class="symbol">当前余额:</span>
                      <span :class="{increase: Fitem.amountBalance > 0, reduce: Fitem.amountBalance < 0}">
                        <span class="symbol"> ￥</span>{{Fitem.amountBalance}}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <!-- <div class="btn" v-if="flowData.length>=3">
              <span class="cfm_btn" @click="flowShow = false">关闭</span>
            </div> -->
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
  import TabItem from 'components/tab'

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
  }
</script>

<style lang='scss' scoped>
  @import './../../scss/SUB/subList';
</style>
