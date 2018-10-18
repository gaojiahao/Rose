<template>
  <div class="pages report-summary-container">
    <div class="date-selector">
      <div class="date-item" :class="{active: item.value === dateSelected}" v-for="(item, index) in dateList"
           :key="index" @click="changeDate(item)">
        <span class="text">{{item.name}}</span>
      </div>
    </div>
    <!--<group class="total-group">
      <cell title="报数汇总" :value="summaryText"></cell>
    </group>-->
    <div class="summary-container" ref="summaryContainer">
      <div class="summary-wrapper">
        <group class="summary-item" v-for="( item,index ) in summaryList" :key="index">
          <cell :title="item.name"></cell>
        </group>
        <divider class="no-data" v-show="summaryList.length === 0">暂无数据</divider>
      </div>
    </div>
    <page-controller :disabledPrev="disabledPrev" :disabledNext="disabledNext" :page="curPage" @pageprev="pagePrev"
                     @pagenext="pageNext"></page-controller>
    <loading :show="showLoading"></loading>
  </div>
</template>

<script>
  import {Group, Cell, Divider} from 'vux'
  import BScroll from 'better-scroll'
  import PageController from 'components/common/page_controller'
  import Loading from 'components/common/loading'
  import reportService from 'service/reportService'
  import dateMixin from 'mixins/date'

  const PAGE_SIZE = 30;
  export default {
    name: "reportsSummary",
    mixins: [dateMixin],
    components: {Group, Cell, Divider, PageController, Loading},
    data() {
      return {
        dateList: [
          {
            name: '昨日',
            value: 'yesterdays'
          },
          {
            name: '本日',
            value: 'days'
          },
          {
            name: '本周',
            value: 'weeks'
          },
        ], // 日期筛选列表
        dateSelected: 'days',
        summaryText: '', // 顶部显示的汇总文案
        summaryList: [], // 数据列表
        summaryScroll: null, // 滚动容器
        curPage: 1, // 当前显示页数
        page: 1, // 请求页数
        showLoading: false, // 是否显示loading
        disabledNext: true, // 是否可点击下一页
      }
    },
    computed: {
      disabledPrev() { // 是否可点击上一页
        return this.page === 1;
      },
    },
    methods: {
      // TODO 获取数据列表
      getUnreported() {
        this.showLoading = true;
        reportService.getUnreported(Object.assign({}, this.getDate(this.dateSelected), {
          pageNo: this.page,
        })).then(repData => {
          this.showLoading = false;
          this.summaryList = [];
          // 数据组装
          repData.items && repData.items.forEach((data, index) => {
            this.summaryList.push({
              name: `${(index + 1) + (this.page - 1) * PAGE_SIZE}. ${data.name}`,
            })
          });
          this.curPage = this.page;
          this.disabledNext = this.summaryList.length < PAGE_SIZE;
          this.$nextTick(() => {
            if (!this.summaryScroll) {
              this.summaryScroll = new BScroll(this.$refs.summaryContainer, {click: true})
            }
            this.summaryScroll.refresh();
            this.summaryScroll.scrollTo(0, 0);
          });
        }).catch(err => {
          this.showLoading = false;
          this.summaryList = [];
          this.$vux.alert.show({
            content: err.message
          })
        })
      },
      // TODO 上一页处理
      pagePrev() {
        this.page--;
        this.getUnreported();
      },
      // TODO 下一页处理
      pageNext() {
        this.page++;
        this.getUnreported();
      },
      // TODO 日期切换
      changeDate(item) {
        this.dateSelected = item.value;
        this.page = 1;
        // this.getReportSummary();
        this.getUnreported();
      },
      // TODO 获取报数汇总
      getReportSummary() {
        reportService.getReportSummary(this.getDate(this.dateSelected)).then(data => {
          this.summaryText = `${data.punchCardNumber || 0}人（共${data.salesmanNumber || 0}人）`;
        })
      },
    },
    created() {
      let query = this.$route.query;
      let dateMap = {
        yesterdays: true,
        days: true,
        weeks: true,
      };
      this.dateSelected = query.dateSelected && dateMap[query.dateSelected] ? query.dateSelected : 'days';

      // this.getReportSummary();
      this.getUnreported();
    },
    mounted() {
      this.$nextTick(() => {
        if (!this.summaryScroll) {
          this.summaryScroll = new BScroll(this.$refs.summaryContainer, {click: true})
        }
      })
    }
  }
</script>

<style lang="scss">
  .report-summary-container {
    // 时间筛选
    .date-selector {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 100%;
      height: 40px;
      background-color: #5077AA;
      color: #fff;
      text-align: center;
      .date-item {
        flex-grow: 1;
        .text {
          padding: 5px;
        }
        &.active {
          .text {
            border-bottom: 2px solid #fff;
          }
        }
      }
    }
    .total-group {
      .weui-cells {
        margin: 5px 0;
      }
    }
    .summary-container {
      height: calc(100% - 80px);
      overflow: hidden;
      .weui-cells {
        margin-top: 0;
      }
      .no-data {
        position: absolute;
        top: 50%;
        margin: 0 40px;
      }
    }
  }
</style>