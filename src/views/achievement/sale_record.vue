<template>
  <div class="pages sale-record-container">
    <r-search :filterList="filterList" @search='searchList'></r-search>
    <!-- <tab :line-width=2 active-color='#111'>
      <tab-item class="vux-center"
                :selected="activeIndex === index"
                v-for="(item, index) in rankList"
                @click.native="tabClick(index)"
                :key="index"
      >
        {{item}}
      </tab-item>
    </tab> -->
    <div class="tab vux-1px-b">
      <div class='each_tab' :class="{active : activeIndex === index ,asc: sort === 'asc'}" v-for="(item,index) in rankList" 
          :key="index" @click="tabClick(index)">
        <span>{{item}}</span>
        <span class='iconfont icon-jiang-copy'></span>
      </div>
      <r-timer class='time_filter' @on-select="changeDate"></r-timer>
    </div>
    <!-- <div class="filters">
      <div class="sort-amt vux-1px-r" :class="{asc: sort === 'asc'}" @click="sortByAmt">
        <span>金额</span>
        <x-icon type="ios-arrow-thin-down" size="20"></x-icon>
      </div>
      <r-timer @on-select="changeDate" :dateShow="showTimer" v-model="showTimer"></r-timer>
    </div> -->
    <div class='business_amount vux-1px-b'>
      <p>销售额</p>
      <p class='amount'>
        ￥
        <countup :end-val=businessAmount :duration="1" :decimals="decimals"></countup>
      </p>
    </div>

    <!--销售排名-->
    <r-scroll :options="scrollOptions" :has-next="hasNext" :no-data="!hasNext && !listData.length"
              @on-pulling-up="onPullingUp" ref="bScroll">
      <div class='sale_rank' v-show="activeIndex === 0">
        <div v-for="(item,index) in listData" class='each_saleman vux-1px-b' @click="goList(item)">
          <span class='sort'>{{index+1}}</span>
          <span class='saleman_name'>{{item.saleOwnerN || item.saleOwner}} {{item.HANDLER_UNIT_NAME}}</span>
          <span class='saleman_amount'>￥{{item.totalAmount}}</span>
          <x-icon type="ios-arrow-right" size="18"></x-icon>
        </div>
      </div>
      <div class='sale_rank' v-show="activeIndex === 1">
        <div v-for="(item,index) in listData" class='each_saleman vux-1px-b'>
          <span class='sort'>{{index+1}}</span>
          <span class='saleman_name'>{{item.INVENTORY_NAME}}</span>
          <span class='saleman_amount'>￥{{item.productTotalAmount}}</span>
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
  import myReportService from "service/myReportService";
  import {accAdd} from 'plugins/calc'
  import loading from "components/common/loading";
  import RSearch from 'components/common/RSearch'
  import RTimer from 'components/common/RTimer'
  import RScroll from 'components/common/RScroll'

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
    },
    data() {
      return {
        remark: "",
        spinner: false,
        timeFilter: {},
        staffRank: [],                    // 业务员销售排名(前三)
        isReset: false,                   // 是否重置
        businessAmount: 0,                // 金额合计
        allSaleReport: [],
        allProductReport: [],
        activeIndex: 0,
        rankList: ['业务员', '产品'],
        filterList: [ // 过滤列表
          {
            name: '姓名',
            value: 'saleOwnerN',
          }, {
            name: '部门',
            value: 'HANDLER_UNIT_NAME'
          },
        ],
        searchVal: '',
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
        decimals: 1,
        sortProperty: 'totalAmount',
        showTimer : false,
        timeText : '日期筛选'
      };
    },
    filters: {
      numberComma
    },
    methods: {
      goList(item) {
        this.$router.push({
          path: '/achievement',
          query: {
            userCode: item.saleOwner
          }
        })
      },
      tabClick(index) {
        if (this.activeIndex === index) {//排序
          this.sort = this.sort === 'asc' ? 'desc' : 'asc';
        }
        else{
          this.sort = 'desc';
        }
       
        let filterLists = [
          [{
            name: '姓名',
            value: 'saleOwnerN',
          }, {
            name: '部门',
            value: 'HANDLER_UNIT_NAME'
          }],
          [{
            name: '存货名称',
            value: 'INVENTORY_NAME',
          }]
        ];
        let propertyLists = ['totalAmount', 'productTotalAmount'];
        this.searchVal = '';       
        this.activeIndex = index;
        this.filterList = filterLists[this.activeIndex];
        this.sortProperty = propertyLists[this.activeIndex];
        this.resetCondition();
        this.getList();
      },
      // TODO 获取请求参数
      getParams() {
        let filter = [];
        let sort = [
          {
            property: this.sortProperty,
            direction: this.sort,
          }
        ];
        if (this.searchVal) {
          filter = [
            {
              // attendedOperation: 'or',		//与and，or或
              property: this.filterProperty,
              operator: 'like',					//模糊查询like，精确查询eq
              value: this.searchVal
            }
          ]
        }
        return {
          page: this.page,
          limit: this.limit,
          sort: JSON.stringify(sort),
          ...this.timeFilter,
          filter: JSON.stringify(filter),
        }
      },
      getReport() {
        return myReportService.allSaleReport(this.getParams()).then(({total = 0, salesman = [], allTotalAmount = 0}) => {
          this.hasNext = total > (this.page - 1) * this.limit + salesman.length;
          let dec = `${allTotalAmount}`.split('.');
          if (dec.length > 1) {
            this.decimals = dec[1].length;
          }
          this.businessAmount = allTotalAmount;
          // this.allSaleReport = salesman;
          this.listData = [...this.listData, ...salesman];
          this.$nextTick(() => {
            this.resetScroll();
          })
        }).catch(e => {
          this.$vux.alert.show({
            content: e.message
          })
        });
      },
      getProduct() {
        return myReportService.allProductReport(this.getParams()).then(({total = 0, product = [], allTotalAmount = 0}) => {
          this.hasNext = total > (this.page - 1) * this.limit + product.length;
          this.businessAmount = allTotalAmount;
          // this.allProductReport = product;
          this.listData = [...this.listData, ...product];
          this.$nextTick(() => {
            this.resetScroll();
          })
        }).catch(e => {
          this.$vux.alert.show({
            content: e.message
          })
        });
      },
      // TODO 请求列表
      getList() {
        switch (this.activeIndex) {
          case 0:
            this.getReport();
            break;
          case 1:
            this.getProduct();
            break;
          default:
            break;
        }
      },
      // TODO 重置列表条件
      resetCondition() {
        switch (this.activeIndex) {
          case 0:
            this.allSaleReport = [];
            break;
          case 1:
            this.allProductReport = [];
            break;
          default:
            break;
        }
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
        this.searchVal = val;
        this.filterProperty = property;
        this.resetCondition();
        this.getList();
      },
      // TODO 修改时间
      changeDate(time) {
        this.timeText = `${time.startDate}~${time.endDate}`
        this.timeFilter = time;
        this.resetCondition();
        this.getList();
      },
      // TODO 重置下拉刷新、上拉加载的状态
      resetScroll() {
        this.$nextTick(() => {
          this.$refs.bScroll.finishPullDown();
          this.$refs.bScroll.finishPullUp();
        })
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
      this.getList();
    }
  };
</script>

<style lang="less" scoped>
  @import "~vux/src/styles/1px.less";
  @import "~vux/src/styles/center.less";

  .vux-1px-t:before,
  .vux-1px-b:after,
  .vux-1px-t:before,
  .vux-1px-tb:before,
  .vux-1px-tb:after {
    border-color: #e8e8e8;
  }

  .sale-record-container {
    background-color: #fff;
    overflow: hidden;
    .search {
      margin-top: .1rem;
    }
    .tab-item-wrapper {
      display: flex;
      justify-content: center;
      align-items: center;
      &.asc {
        .iconfont {
          transform: rotate(-180deg);
        }
      }
    }
    .tab{
      height: 0.4rem;
      display: flex;
      text-align: center;
      align-items: center;
      position: relative;
      .each_tab{
        flex: 1;
        font-size:0.14rem;
        font-weight: bold;
        display: flex;
        width: 50%;
        justify-content: center;
        align-items: center;
        .iconfont{
        font-size:0.11rem;
         display: inline-block;
        }
        .icon-shaixuan{
          font-size:0.12rem;
        }
        &.active{
          color:#5077aa;  
        }
        &.asc {
          .icon-jiang-copy{
            transform: rotate(-180deg);
          }
        }
        &.has_time{
          font-weight: normal;
          font-size:0.12rem;
        }
      }
      .time_filter{
        flex: 1;
      }
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
      height: ~'calc(100% - 1.36rem)';
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
        align-items: center;
        padding: 0.07rem;
        .arrow_right {
          margin-left: 0.05rem;
        }
        .sort {
          width: 0.3rem;
        }
        .saleman_name {
          flex: 1.5;
        }
        .saleman_amount {
          flex: 1.5;
          text-align: right;
          margin-right: 0.05rem;

        }
      }
    }
  }
</style>
