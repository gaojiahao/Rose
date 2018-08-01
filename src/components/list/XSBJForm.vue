<template>
  <div class="pages">
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
          <div class="duty_top">
            <p class="duty_name">
                <span class="duty_status">
                    <span class="duty_status_info" :class="item.biStatus === '已生效' ? 'duty_process_c' : 'duty_wait_c'">{{item.biStatus}}</span>
                </span>
            </p>
          </div>
          <div class="duty_btm">
            <p class="duty_code">
              {{item.transCode}}
              <span class="duty_crt_man">{{item.handlerName}}</span>
            </p>
            <p class="duty_time">{{item.crtTime | filterTime}}</p>
          </div>
        </div>
      </r-scroll>
    </div>
    <div class="btn vux-1px-t">
      <div class="cfm_btn" @click="goEdit">新增一个报价</div>
    </div>
  </div>
</template>

<script>
  import {Tab, Icon, TabItem, LoadMore, numberPad, Spinner} from 'vux'
  import {getList} from 'service/commonService.js'
  import searchIcon from '../search.vue'
  import RScroll from 'components/RScroll'

  export default {
    data() {
      return {
        listBscrol: null,
        page: 1,
        limit: 20,
        hasNext: true,
        listStatus: [{name: '全部', status: ''}, {name: '已生效', status: 1}, {name: '进行中', status: 2}],
        activeIndex: 0,
        serachVal: '',
        listData: [],
        activeTab: '',
        scrollOptions: {
          click: true,
          pullDownRefresh: true,
          pullUpLoad: true,
        }
      }
    },
    components: {
      Tab, Icon, TabItem, LoadMore, searchIcon, Spinner, RScroll,
    },
    methods: {
      goDetail(transCode) {
        let {code} = this.$route.params;
        this.$router.push({
          path: `/list/${code}/detail`,
          query: {
            transCode
          }
        })
      },
      goEdit() {
        let {code} = this.$route.params;
        this.$router.push({
          path: `/list/${code}/fillform`,
        })
      },
      // TODO 重置列表条件
      resetCondition() {
        this.listData = [];
        this.page = 1;
        this.hasNext = true;
        this.$refs.bScroll.scrollTo(0, 0);
        this.$refs.bScroll.resetPullDown();
      },
      ///tab切换
      tabClick(item, index) {
        this.activeIndex = index;
        this.activeTab = item.status;
        this.resetCondition();
        this.getList();
      },
      // TODO 搜索
      searchList(val) {
        this.serachVal = val;
        this.activeTab = '';
        this.activeIndex = 0;
        this.resetCondition();
        this.getList();
      },
      //获取销售报价数据
      getList(noReset = false) {
        let filter = [
          {
            operator: 'eq',
            value: this.activeTab,
            property: 'biStatus',
          }
        ];
        if (!this.activeIndex) {
          filter[0].operator = 'like';
        }
        if (this.serachVal) {
          filter[0].attendedOperation = 'and (';
          filter = [
            ...filter,
            {
              operator: 'like',
              value: this.serachVal,
              property: 'transCode',
              attendedOperation: 'or'
            },
            {
              operator: 'like',
              value: this.serachVal,
              property: 'handlerName',
              attendedOperation: ')'
            },
          ];
        }
        return getList(2189, {
          limit: this.limit,
          page: this.page,
          start: (this.page - 1) * this.limit,
          filter: JSON.stringify(filter)
        }).then(({dataCount = 0, tableContent = []}) => {
          this.hasNext = dataCount > (this.page - 1) * this.limit + tableContent.length;
          this.listData = this.page === 1 ? tableContent : this.listData.concat(tableContent);
          if (!noReset) {
            this.$nextTick(() => {
              this.resetScroll();
            })
          }
        }).catch(e => {
          this.resetScroll();
        })
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
      // TODO 下拉刷新
      onPullingDown() {
        this.page = 1;
        this.getList(true).then(() => {
          this.$nextTick(() => {
            this.$refs.bScroll.finishPullDown().then(() => {
              this.$refs.bScroll.finishPullUp();
            });
          })
        });
      },
      // TODO 重新请求全部页签的列表数据
      reloadData(){
        this.serachVal = '';
        this.activeTab = '';
        this.activeIndex = 0;
        this.resetCondition();
        this.getList();
      }
    },
    filters: {
      // TODO 过滤日期
      filterTime(val) {
        if (val) {
          let date = new Date(val);
          return `${date.getFullYear()}-${numberPad(date.getMonth() + 1)}-${numberPad(date.getDate())}`;
        }
      }
    },
    created() {
      this.getList();
    },
    beforeRouteEnter(to, from, next) {
      next(r => {
        console.log(r);
      })
    }
  }
</script>

<style lang='scss' scoped>
  .content {
    width: 100%;
    height: 90%;
    overflow: auto;
  }

  .list_top {
    width: 100%;
    padding-top: .1rem;
    // 过滤
    .filter_part {
      margin-top: .04rem;
    }
  }

  .list_wrapper {
    position: relative;
    margin-top: .08rem;
    width: 100%;
    height: calc(100% - .52rem - 44px);
    overflow: hidden;
    box-sizing: border-box;
    .each_duty {
      margin: .2rem auto;
      padding: .1rem;
      position: relative;
      width: 85%;
      box-shadow: 0 0.02rem 0.2rem #e8e8e8;
      .duty_name { //任务名称
        width: 100%;
        font-size: .16rem; // 1rem=100px 手机像素2：1 这里原字体大小为16px
        font-weight: bold;
        max-height: 1rem;
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        .duty_status { //任务状态
          font-size: .12rem; // 这里原字体大小为14px
          color: #fff;
          margin-right: .05rem;
          display: inline-block;
          vertical-align: middle;
          margin-top: -2px;
          .duty_status_name,
          .duty_status_info {
            padding: 1px 4px;
          }
          .duty_status_name {
            background: #000;
          }
          .duty_status_info { //进行中

          }
          .duty_process_c {
            background: #26AB28;
          }
          .duty_wait_c {
            background: #FADB51;
            color: #000;
          }
          .duty_urgent_c {
            background: #E34E43;
          }
        }
      }
      .duty_btm {
        height: .24rem;
        line-height: .24rem;

        .duty_code { //任务编码
          float: left;
          font-size: .15rem;
          color: #7D7D7D;
          font-weight: 200;

          .duty_crt_man { // 任务创建者
            position: relative;
            background: #333;
            font-size: 0.12rem;
            color: #FDF6A4;
            padding: .02rem;

          }
          .duty_crt_man:before { //左尖角
            position: absolute;
            content: "";
            width: 0;
            height: 0;
            top: 0;
            left: -.03rem;
            border-right: .04rem solid #333;
            border-bottom: .04rem solid transparent;
          }
        }
        .duty_time { //任务创建时间
          float: right;
          font-size: .15rem;
          color: #7D7D7D;
          font-weight: 200;
        }
      }
    }
  }

  // 确定
  .btn {
    left: 0;
    bottom: 0;
    width: 100%;
    height: 10%;
    position: fixed;
    background: #fff;
    .cfm_btn {
      top: 50%;
      left: 50%;
      width: 2.8rem;
      color: #fff;
      height: .44rem;
      line-height: .44rem;
      position: absolute;
      text-align: center;
      background: #5077aa;
      border-radius: .4rem;
      transform: translate(-50%, -50%);
      box-shadow: 0 2px 5px #5077aa;
    }
  }

</style>
