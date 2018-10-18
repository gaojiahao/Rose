<template>
  <div class="pages sale-record-container">
    <!--<r-search :filterList="filterList" @search='searchList'></r-search>-->
    <person-info></person-info>
    <div class="filters vux-1px-b">
      <div class="sort-amt vux-1px-r" :class="{asc: sort === 'asc'}" @click="sortByAmt">
        <span>金额</span>
        <x-icon type="ios-arrow-thin-down" size="20"></x-icon>
      </div>
      <r-timer @on-select="changeDate"></r-timer>
    </div>
    <div class='business_amount vux-1px-b'>
      <p>销售额</p>
      <p class='amount'>
        ￥
        <countup :end-val=businessAmount :duration="1" :decimals="2"></countup>
      </p>
    </div>

    <!--销售排名-->
    <r-scroll :options="scrollOptions" :has-next="hasNext" :no-data="!hasNext && !listData.length"
              @on-pulling-up="onPullingUp" ref="bScroll">
      <div class='sale_rank'>
        <div v-for="(item,index) in listData" class='each_saleman vux-1px-b'>
          <span class='sort'>{{index+1}}</span>
          <span class='saleman_name'>{{item.INVENTORY_NAME}}</span>
          <span class='saleman_amount'>￥{{item['价税总计']}}</span>
        </div>
      </div>
    </r-scroll>

    <!-- <loading :show='spinner'></loading> -->
  </div>
</template>

<script>
  import {
    Tab,
    TabItem,
    Divider,
    SwiperItem,
    FormPreview,
    numberComma,
    CellFormPreview,
    Countup, dateFormat
  } from "vux";
  import tokenService from './../service/tokenService'
  import myReportService from "../service/myReportService";
  import loading from "./loading";
  import RSearch from './common/RSearch'
  import RTimer from './common/RTimer'
  import RScroll from './common/RScroll'
  import PersonInfo from './common/PersonInfo'

  export default {
    components: {
      Tab,
      TabItem,
      Divider,
      loading,
      SwiperItem,
      FormPreview,
      CellFormPreview,
      Countup,
      RSearch,
      RTimer,
      RScroll,
      PersonInfo,
    },
    data() {
      return {
        spinner: false,
        timeFilter: {},
        isReset: false,                   // 是否重置
        businessAmount: 0,                // 金额合计
        activeIndex: 1,
        filterList: [],
        serachVal: '',
        filterProperty: '',
        hasNext: true,
        scrollOptions: {
          click: true,
          // pullDownRefresh: true,
          pullUpLoad: true,
        },
        page: 1,
        limit: 20,
        listData: [],
        sort: 'desc',
        userInfo: {},
      };
    },
    filters: {
      numberComma
    },
    methods: {
      // TODO 获取当前用户信息
      getUser() {
        return tokenService.getUser().then(data => {
          this.userInfo = data;
        })
      },
      // TODO 获取请求参数
      getParams() {
        let filter = [
          {
            property: 'saleOwner',
            operator: 'like',					//模糊查询like，精确查询eq
            value: this.userInfo.userCode
          }
        ];
        if (this.serachVal) {
          filter = [
            {
              // attendedOperation: 'or',		//与and，or或
              property: this.filterProperty,
              operator: 'like',					//模糊查询like，精确查询eq
              value: this.serachVal
            }
          ]
        }
        return {
          page: this.page,
          limit: this.limit,
          sort: this.sort,
          ...this.timeFilter,
          filter: JSON.stringify(filter),
        }
      },
      // TODO 请求列表
      getList() {
        return myReportService.allSaleReport(this.getParams()).then(({total = 0, salesman = [], allTotalAmount = 0}) => {
          // 防止出现工号相同、名字不同的
          let performance = salesman.reduce((performance, item) => {
            return [...performance, ...item.performance];
          }, []);
          this.hasNext = total > (this.page - 1) * this.limit + performance.length;
          this.businessAmount = allTotalAmount;
          this.listData = [...this.listData, ...performance];
          this.$nextTick(() => {
            this.resetScroll();
          })
        }).catch(e => {
          this.$vux.alert.show({
            content: e.message
          })
        });
      },
      // TODO 重置列表条件
      resetCondition() {
        this.listData = [];
        this.page = 1;
        this.hasNext = true;
        this.$nextTick(() => {
          this.$refs.bScroll.scrollTo(0, 0);
          this.$refs.bScroll.resetPullDown();
        })
      },
      // TODO 搜索
      searchList({val = '', property = ''}) {
        this.serachVal = val;
        this.filterProperty = property;
        this.resetCondition();
        this.getList();
      },
      // TODO 修改时间
      changeDate(time) {
        this.timeFilter = time;
        this.resetCondition();
        this.getList();
      },
      // TODO 重置下拉刷新、上拉加载的状态
      resetScroll() {
        this.$refs.bScroll.finishPullDown();
        this.$refs.bScroll.finishPullUp();
      },
      // TODO 上拉加载
      onPullingUp() {
        this.page++;
        this.getList();
      },
      // TODO 排序
      sortByAmt() {
        this.sort = this.sort === 'asc' ? 'desc' : 'asc';
        this.resetCondition();
        this.getList();
      },
    },
    created() {
      this.spinner = true;
      this.getUser().then(() => {
        this.getList();
      });
    }
  };
</script>

<style lang="less" scoped>
  @import "~vux/src/styles/1px.less";

  .sale-record-container {
    background-color: #fff;
    overflow: hidden;
    .search {
      margin-top: .1rem;
    }
    .filters {
      display: flex;
      .sort-amt {
        display: flex;
        width: 50%;
        justify-content: center;
        align-items: center;
        font-size: 14px;
        &.asc {
          .vux-x-icon-ios-arrow-thin-down {
            transform: rotate(-180deg);
          }
        }
      }
    }
    .scroll-container {
      height: ~'calc(100% - 2.36rem)';
      overflow: hidden;
    }
    .business_amount {
      background: #fff;
      padding: 10px 0;
      font-size: 18px;
      font-weight: bold;
      text-align: center;
      .amount {
        font-size: 30px;
        color: #c93d1b;
        font-weight: 200;
      }
    }
    .sale_rank {
      background: #fff;
      padding: 0 0.1rem;
      .title {
        text-align: center;
        font-size: 0.18rem;
        font-weight: bold;
        padding: 0.03rem 0;
      }
      span {
        font-size: 0.16rem;
        text-align: left;
      }
      .each_saleman {
        line-height: 0.3rem;
        display: flex;
        padding: 0.07rem;
        .sort {
          width: 0.3rem;
        }
        .saleman_name {
          flex: 1.5;
        }
        .saleman_amount {
          flex: 1.5;
          text-align: right;

        }
      }
    }
  }
</style>
