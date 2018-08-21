<template>
  <div class="pages" ref='list'>
    <div class='content'>
      <div class="list_top">
        <!-- 搜索栏 -->
        <searchIcon @search='searchList'></searchIcon>
        <div class="filter_part">
          <tab :line-width='2' default-color='#757575' active-color='#2c2727'>
            <tab-item v-for="(item, index) in listStatus" :key="index" :selected="index === activeIndex"
                      @on-item-click="tabClick(item, index)">{{item.name}}
            </tab-item>
          </tab>
        </div>
      </div>
      <r-scroll class="list_wrapper" :options="scrollOptions" :has-next="hasNext"
                :no-data="!hasNext && !listData.length" @on-pulling-up="onPullingUp" @on-pulling-down="onPullingDown"
                ref="bScroll">
        <div class="each_duty" v-for="(item, index) in listData" :key="index" @click='goDetail(item.transCode)'>
          <!-- 订单编号, 时间 -->
          <div class="duty_top">
            <p class="duty_code">
              {{item.transCode}}
              <span class="duty_crt_man" :class="item.statusClass">{{item.biStatus}}</span>
            </p>
            <p class="duty_time">{{item.effectiveTime}}</p>
          </div>
          <div class="duty_content">{{item.opportunityTitle}}</div>
          <!-- 报销人，金额合计 -->
          <div class="order_count">
            <div class="handle_man">
              {{item.handlerName}}<span style="fontSize:.1rem;">[报销人]</span>
            </div>
            <div class="money_part">
              <span class="money">
                <span style="fontSize:.1rem;">￥</span>{{item.count | numberComma}}
              </span>
            </div>
          </div>
        </div>
      </r-scroll>
    </div>
    <div class=" vux-1px-t btn ">
      <div class="cfm_btn" @click="goEdit">新增一个商机</div>
    </div>
  </div>
</template>

<script>
  import listCommon from './../mixins/bizListCommon'
  export default {
    data() {
      return {
        listStatus: [
          {name: '全部', status: ''}, 
          {name: '已生效', status: '已生效'}, 
          {name: '进行中', status: '进行中'}
        ],
        listViewID :2244 
      }
    },
    mixins: [listCommon],
    methods: {
    },
    created() {
      
    }

  }
</script>

<style lang='scss' scoped>
  @import "../scss/bizList.scss";
  .duty_content{
    padding: .04rem .1rem;
    color: #7d7d7d;
  }
</style>
