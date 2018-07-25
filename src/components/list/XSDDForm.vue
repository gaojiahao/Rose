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
          <div class="duty_top">
            <p class="duty_name">
              <span class="duty_status">
                <span class="duty_status_info"
                      :class="item.statusClass">{{item.statusName}}</span>
              </span>
            </p>
          </div>
          <!-- 物料图片和名称 -->
          <ul class="duty_matter">
            <li class="duty_matter_item" v-for="(mItem, mIndex) in item.itmes" :key="mIndex">
              <img class="matter_img" :src="mItem.inventoryPic" @error="getDefaultImg(mItem)">
              <div class="matter_name">{{mItem.inventoryName}}</div>
            </li>
          </ul>
          <div class="duty_btm">
            <p class="duty_code">
              {{item.transCode}}
              <span class="duty_crt_man">{{item.handlerName}}</span>
            </p>
            <p class="duty_time">{{item.effectiveTime | filterTime}}</p>
          </div>
        </div>

      </r-scroll>
    </div>
    <div class="btn vux-1px-t">
      <div class="cfm_btn" @click="goEdit">新增一个订单</div>
    </div>
  </div>
</template>

<script>
  import {Tab, Icon, TabItem, LoadMore, numberPad, Spinner} from 'vux'
  import {getSellOrderList} from 'service/listService'
  import searchIcon from '../search.vue'
  import RScroll from 'components/RScroll'

  export default {
    data() {
      return {
        page: 1,
        limit: 20,
        hasNext: true,
        scrollOptions: {
          click: true,
          pullDownRefresh: true,
          pullUpLoad: true,
        },
        listStatus: [{name: '全部', status: ''}, {name: '已生效', status: '已生效'}, {name: '进行中', status: '进行中'}],
        activeIndex: 0,
        serachVal: '',
        listData: [],
        activeTab: ''

      }
    },
    components: {
      Tab, Icon, TabItem, searchIcon, RScroll
    },
    methods: {
      goDetail(code) {
        this.$router.push({
          path: '/list/detail',
          query: {
            transCode: code
          }
        })
      },
      goEdit() {
        this.$router.push({
          path: '/list/fillform',
          query: {
            code: 'XSDD'
          }
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
        this.getOrderList();
      },
      searchList(val) {
        this.serachVal = val;
        this.resetCondition();
        this.getOrderList();
      },
      //获取销售订单数据
      getOrderList(noReset = false) {
        let filter = {
          biStatus: this.activeTab,
          transCode: this.serachVal,
          handlerName: this.serachVal,
        };

        return getSellOrderList({
          limit: this.limit,
          page: this.page,
          // start: (this.page - 1) * this.limit,
          listViewID: 2190,
          // filter: JSON.stringify(filter),
          filer: JSON.stringify(filter),
        }).then(({total = 0, orders = []}) => {
          this.hasNext = total > (this.page - 1) * this.limit + orders.length;
          orders.forEach(item => {
            this.setStatus(item);
            item.itmes = item.itmes.slice(0, 3);
            item.itmes.forEach(mItem => {
              mItem.inventoryPic = mItem.inventoryPic ? `/H_roleplay-si/ds/download?url=${mItem.inventoryPic}` : this.getDefaultImg();
            })
          });
          this.listData = this.page === 1 ? orders : this.listData.concat(orders);
          if (!noReset) {
            this.$nextTick(() => {
              this.resetScroll();
            })
          }
        }).catch(e => {
          this.resetScroll();
        })
      },
      // TODO 获取默认图片
      getDefaultImg(item) {
        let url = require('assets/wl.png');
        if (item) {
          item.inventoryPic = url;
        }
        return url
      },
      // TODO 设置状态的class和显示的名称
      setStatus(item) {
        switch (item.biStatus) {
          case '进行中':
            item.statusClass = 'duty_wait_c';
            item.statusName = '进行中';
            break;
          case '已生效':
            item.statusClass = 'duty_process_c';
            item.statusName = '已生效';
            break;
        }
      },
      // TODO 重置下拉刷新、上拉加载的状态
      resetScroll() {
        this.$refs.bScroll.finishPullDown();
        this.$refs.bScroll.finishPullUp();
      },
      // TODO 上拉加载
      onPullingUp() {
        this.page++;
        this.getOrderList();
      },
      // TODO 下拉刷新
      onPullingDown() {
        this.page = 1;
        this.getOrderList(true).then(() => {
          this.$nextTick(() => {
            this.$refs.bScroll.finishPullDown().then(() => {
              this.$refs.bScroll.finishPullUp();
            });
          })
        });
      },
      reloadData() {
        this.serachVal = '';
        this.activeTab = '';
        this.activeIndex = 0;
        this.resetCondition();
        this.getOrderList();
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
      this.getOrderList();
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
    /* 物料 */
    .duty_matter {
      display: flex;
      .duty_matter_item {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        margin-right: .1rem;
        max-width: 1rem;
      }
      .matter_img {
        width: .75rem;
        height: .75rem;
      }
      .matter_name {
        width: 100%;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        text-align: center;
      }
    }
    .pullDownRefresh {
      display: block;
      margin: 0 auto;
      height: 30px;
      position: absolute;
      top: -30px;
      left: 50%;
      transform: translateX(-50%);
      transition: top;
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
