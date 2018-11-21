<template>
  <div class="pages sale-record-container">
    <div class="filters vux-1px-b">
      <div class="sort-amt" :class="{asc: sort === 'asc'}" @click="sortByAmt">
        <span>金额</span>
        <span class='iconfont icon-jiang-copy'></span>
      </div>
      <r-timer class="filter_time" @on-select="changeDate" :width-scale="200"></r-timer>
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
        <div class='title'>产品销售排行榜</div>
        <div v-for="(item,index) in listData" class='each_saleman vux-1px-b'>
          <span class='sort'>{{index+1}}</span>
          <span class='saleman_name'>{{item.INVENTORY_NAME}}</span>
          <span class='saleman_amount'>￥{{item.totalAmount}}</span>
        </div>
      </div>
    </r-scroll>
    <div class='btn vux-1px-t'  @click="goList">
      <div class='cfn_btn'>查看订单</div>
    </div>
    <!-- <loading :show='spinner'></loading> -->
  </div>
</template>

<script>
  import {
    Tab,
    TabItem,
    Divider,
    FormPreview,
    numberComma,
    CellFormPreview,
    Countup, dateFormat
  } from "vux";
  import tokenService from 'service/tokenService'
  import myReportService from "service/myReportService";
  import loading from "components/common/loading";
  import RSearch from 'components/common/RSearch'
  import RTimer from 'components/common/RTimer'
  import RScroll from 'components/common/RScroll'
  import PersonInfo from 'components/common/PersonInfo'

  export default {
    components: {
      Tab,
      TabItem,
      Divider,
      loading,
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
        userInfo: {
          userCode : ''
        },
        sortProperty: 'totalAmount',
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
      //查看订单
      goList(){
        this.$router.push({
          path:'/achievement',
          query:{
            userCode : this.userInfo.userCode
          }
        }
        )
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
        let sort = [
          {
            property: this.sortProperty,
            direction: this.sort,
          }
        ];
        return {
          page: this.page,
          limit: this.limit,
          sort: JSON.stringify(sort),
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
      // this.getList();
      this.getUser().then(() => {
        this.getList();
      });
    }
  };
</script>

<style lang="less" scoped>
  @import "../../../node_modules/vux/src/styles/1px.less";
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
    .filters {
      display: flex;
      .sort-amt {
        display: flex;
        width: 50%;
        justify-content: center;
        align-items: center;
        font-size: 0.14rem;
        font-weight: bold;
        .iconfont{
          font-size: 0.11rem;
          display: inline-block;
          font-weight: bold;
        }
        &.asc {
          .icon-jiang-copy{
            transform: rotate(-180deg);
          }
          .vux-x-icon-ios-arrow-thin-down {
            transform: rotate(-180deg);
          }
        }
      }
      .filter_time{
        width:50%;
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
        padding: 0.05rem 0;
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
          flex: 2.5;
        }
        .saleman_amount {
          flex: 1.5;
          text-align: right;

        }
      }
    }
    .btn{
      left: 0;
      bottom: 0;
      width: 100%;
      height: .8rem;
      position: absolute;
      background: #fff;
    .cfn_btn{
      top: 50%;
      left: 50%;
      width: 2.8rem;
      color: #fff;
      // color: #5077aa;
      height: .44rem;
      line-height: .44rem;
      position: absolute;
      text-align: center;
      background: #5077aa;
      // border:1px solid #5077aa;
      border-radius: .4rem;
      // border-color:  #5077aa;
      transform: translate(-50%, -50%);
      font-size: 0.16rem;
      box-shadow: 0 2px 5px #5077aa;
    }
      
    }
  }
</style>
