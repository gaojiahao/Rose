<template>
  <div class="pages" ref='list'>
    <div class='content'>
      <div class="list_top">
        <!-- 搜索栏 -->
        <searchIcon @search='searchList'></searchIcon>
        <div class="filter_part">
          <tab-item :tabVal="listView" @tab-click='tabClick'></tab-item>
        </div>
      </div>
      <r-scroll class="list_wrapper":options="scrollOptions" :has-next="hasNext"
                :no-data="!hasNext && !listData.length" @on-pulling-up="onPullingUp" @on-pulling-down="onPullingDown"
                ref="bScroll">
        <div class='each_duty' v-for='(item,index) in listData' :key='index' @click="getFlow(item)">
          <!-- 仓库名称 仓库编码 -->
          <div class="duty_top">
              <!-- 表单状态 及 编码 -->
              <div class="warehouse_info">
                <!-- <span class="warehouse warehouse_code">{{item.warehouseRelType}}</span> -->
                <!-- 状态 -->
                <span class="warehouse warehouse_name">
                  <!-- 仓库编码 -->
                  {{item.warehouseName}}
                </span>
                <!-- 编码 -->
                <span class="warehouse warehouse_code">{{item.whCode}}</span>
              </div>
              <!-- 数量余额 -->
              <div class="mater_code" v-if="item.qtyBalance >= 0">
                <span class="title">数量剩余</span>
                <span class="num">{{item.qtyBalance}}</span>
              </div>
              <div class="mater_code" v-if="item.qtyLocked >= 0">
                <span class="title">数量剩余</span>
                <span class="num">{{item.qtyLocked}}</span>
              </div>
          </div>
          <!-- 物料 -->
          <div class='matter'>
            <div class='matter_name'>
              {{item.inventoryName}}<span class="type">[{{item.invProcessing}}]</span>
            </div>
            <div class="mater_days" >
              <span class="days" v-if="item.accountAge >= 0">账龄天数 {{item.accountAge}}</span>
              <span class="days" v-if="item.libraryAge >= 0">库龄天数 {{item.libraryAge}}</span>
              <span class="days" v-if="item.nearKeepingDays >= 0">保质剩余天数 {{item.nearKeepingDays}}</span>
            </div>
          </div>
          <!-- 仓库类型、金额余额等 -->
          <div class='duty_btm vux-1px-t'>
            <!-- 仓库类型 -->
            <div class="ware_type">
              {{item.warehouseType || '暂无'}}<span class="type">[仓库类型]</span>
            </div>
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
              <div class='flow_top'>
                <div class="title">流水详情</div>
                <div class="name">
                  {{flowTitle.inventoryName}}<span class="symbol">[{{flowTitle.invProcessing}}]</span>
                </div>
              </div>
              <div class="flow_list">
                <div class='each_flow' v-for='(Fitem,Findex) in flowData' :key="Findex" @click.stop="Fitem.showList = !Fitem.showList">
                  <!--展开状态-->

                  <div class="duty_top">
                    <!-- 实例编码 -->
                    <div class='transCode'>
                      <span class="order_title">编码</span>
                      <span class="order_num">{{Fitem.transCode}}</span>
                    </div>
                    <!-- 时间 -->
                    <div class="time">
                      {{Fitem.calcTime | dateFormat}}
                    </div>
                  </div>

                  <!-- 数量，金额 -->
                  <div class='show_list'>
                    <!-- 应用名称 -->
                    <div class="app_name">
                      {{Fitem.appTitle}}<span class="symbol">[应用]</span>
                    </div>
                    <div class="num_info">
                      <!-- 数量 -->
                      <div class="count">
                        <div class="num_part" v-if='Fitem.drQty>0'>
                          <span class="symbol">本次数量: </span>
                          <span class="number_incre">+ {{Fitem.drQty}}</span>
                        </div>
                        <div class="num_part" v-else-if='Fitem.crQty>0'>
                          <span class="symbol">本次数量: </span>
                          <span class="number_redu">- {{Fitem.crQty}}</span>
                        </div>
                        <div class="num_part" v-else>
                          <span class="symbol">本次数量: </span>
                          <span>不变</span>
                        </div>
                      </div>
                      <!-- 金额 -->
                      <div class="amount_money">
                        <div class="num_part" v-if='Fitem.drAmnt>0'>
                          <span class="symbol">本次金额: </span>
                          <span class="number_incre">+ {{Fitem.drAmnt}}</span>
                        </div>
                        <div class="num_part" v-else-if='Fitem.crAmnt>0'>
                          <span class="symbol">本次金额: </span>
                          <span class="number_redu">- {{Fitem.crAmnt}}</span>
                        </div>
                        <div class="num_part" v-else>
                          <span class="symbol">本次金额: </span>
                          <span>不变</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="summary_part vux-1px-t">
                    <div class="number">
                      <span class="symbol">当前数量: </span>{{Fitem.qtyBalance}}
                    </div>
                    <div class="price">
                      <span class="symbol">当前余额: ￥</span>{{Fitem.amountBalance}}
                    </div>
                  </div>
                </div>
                <div>
                </div>
              </div>
            <!-- <div class="btn" v-if='flowData.length >= 3'>
              <span class="cfm_btn" @click="flowShow = false">关闭</span>
            </div> -->
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
  import listCommon from './../mixins/kmListCommon'
  import TabItem from 'components/tab'
  export default {
    data() {
      return {
        uniqueId : 1400,
        showContent : false,
        filterArr: [
            {"operator":"like","value":"","property":"warehouseName"}
        ],
      }
    },
    components:{
      TabItem
    },
    mixins: [listCommon]
  }
</script>

<style lang='scss' scoped>
  @import './../scss/SUB/subList';
</style>
