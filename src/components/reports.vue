<template>
  <div class="pages reports-container">
    <group class="calendar-group" v-show="false">
      <calendar @on-change="onChange" v-model="filterDate" title="时间段选择" popup-header-title="请选择时间段"
                disable-future></calendar>
    </group>
    <div class="select-part">
      <div class="each-select " @click="dateClick">
        <div>
          <span class="each-select-name">{{dateSelected.name}}</span>
          <i class="iconfont title_right" :class="showDate?'icon-xiaosanjiaoup':'icon-xiaosanjiaodown'"></i>
        </div>
        <group class="date-list-container" v-show="showDate">
          <cell :title="item.name" v-for="(item, index) in dateList" :key="index"
                @click.native.stop="dateItemClick(item)" :class="{selected: item.name === dateSelected.name}"></cell>
        </group>
      </div>
      <div class="each-select " @click="projClick">
        <div>
          <span class="each-select-name"
                :class="{'is-selected': objName !== A_PROJ_NAME}">{{objName | nameFilter}}</span>
          <i class="iconfont title_right" :class="showProj?'icon-xiaosanjiaoup':'icon-xiaosanjiaodown'"></i>
        </div>
        <group class="proj-list-container" v-show="showProj">
          <cell :title="item" v-for="(item, index) in projList" :key="index"
                @click.native.stop="projItemClick(item, index)" :class="{selected: item === objName}"></cell>
        </group>
      </div>
      <div class="each-select " @click="aProjClick">
        <span class="each-select-name" :class="{'is-selected': objName === A_PROJ_NAME}">A类产品</span>
      </div>
    </div>
    <group class="total-group">
      <cell title="合计" :value="totalText"></cell>
    </group>
    <group class="total-group" v-show="objName === A_PROJ_NAME">
      <cell title="报数汇总" :value="summaryText" @click.native="goSummary" is-link></cell>
    </group>
    <div class="rank-container" :class="{'has-summary': objName === A_PROJ_NAME}" @click="hideDropList"
         ref="rankContainer">
      <div class="rank-wrapper">
        <group class="rank-item" v-for="( item,index ) in reportList" :key="index">
          <cell :value=item.sales :title=item.name is-link :border-intent="false"
                :arrow-direction="item.showContent ? 'up' : 'down'"
                @click.native="item.showContent = !item.showContent"></cell>
          <div v-show="item.showContent">
            <cell-form-preview :border-intent="true" :list="item.detail"></cell-form-preview>
          </div>
        </group>
        <divider class="no-data" v-show="reportList.length === 0">暂无数据</divider>
      </div>
    </div>
    <div class="page-controler">
      <span class="each-page" @click="pagePrev" :class="{disabled: page === 1}"><i
        class="iconfont icon-jiantou-copy"></i></span>
      <span class="each-page page-num">{{curPage}}</span>
      <span class="each-page" @click="pageNext" :class="{disabled: isDisabled}"><i
        class="iconfont icon-jiantou"></i></span>
    </div>
    <loading :show="showLoading"></loading>
  </div>
</template>

<script>
  import {
    Tab,
    Cell,
    Grid,
    Group,
    TabItem,
    Divider,
    GridItem,
    Calendar,
    Selector,
    numberComma,
    numberPad,
    PopupPicker,
    CellFormPreview,
  } from 'vux'
  import reportService from '../service/reportService'
  import saleReportService from '../service/saleRepotService'
  import Loading from './loading'
  import BScroll from 'better-scroll'
  import dateMixin from './../mixins/date'

  const PROJ_LIST = 'ROSE_PROJ_LIST';
  const DATE_SELECTED = 'ROSE_DATE_SELECTED';
  const PAGE_SIZE = 30;
  const A_PROJ_NAME = 'A类产品'; // A类产品名称
  export default {
    mixins: [dateMixin],
    components: {
      Tab,
      Cell,
      Group,
      TabItem,
      Calendar,
      CellFormPreview,
      Grid,
      GridItem,
      PopupPicker,
      Selector,
      Divider,
      Loading
    },
    data() {
      return {
        A_PROJ_NAME: 'A类产品', // A类产品名称
        showTab: true, // 是否展示日期列表
        activeIndex: 0,
        filterDate: [], // 日历的选中数据
        reportList: [], // 当前展示的列表
        curTab: 'days',
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
          {
            name: '本月',
            value: 'months'
          },
          {
            name: '本年',
            value: 'years'
          },
        ], // 日期列表
        reportData: {}, // 获取的列表数据
        filterParams: {}, // 过滤条件
        showDate: false, // 是否展示日期列表
        dateSelected: { // 选中的日期
          name: '本日',
          value: 'days'
        },
        showProj: false, // 是否展示产品列表
        projList: [], // 产品列表
        page: 1, // 请求页码
        curPage: 1, // 当前页码
        objName: A_PROJ_NAME, // 项目类型
        isDisabled: false,
        showLoading: false,
        totalData: [], // 获取的合计数据
        totalText: '', // 合计栏当前展示的文案
        rankScroll: null,
        summaryText: '', // 报数汇总
      }
    },
    methods: {
      onItemClick(item) {
        this.curTab = item.value;
        this.reportList = this.reportData[item.value]
      },
      onChange(val) {
        // this.showTab = false
      },
      // TODO 重置数据
      resetData(key = 'reportData') {
        this[key] = {
          yesterdays: [],
          days: [],
          weeks: [],
          months: [],
          years: []
        }
      },
      // TODO 组装数据，有日期过滤
      assembleData() {
        return new Promise((resolve, reject) => {
          this.showLoading = true;
          reportService.getReportByDate(Object.assign(this.filterParams, this.getDate(this.dateSelected.value), {
            objName: this.objName,
            pageNo: this.page
          })).then(repData => {
            this.showLoading = false;
            this.reportList = [];
            // 数据组装
            repData.items && repData.items.forEach((data, index) => {
              let detail = [
                {
                  label: '项目类产品',
                  value: `${data.quantity || 0}件/套`
                }, {
                  label: '项目类金额',
                  value: `￥${numberComma(data.amount || 0)}`
                }, {
                  label: 'A类产品',
                  value: `￥${numberComma(data.aProduct || 0)}`
                }, {
                  label: '所属区域',
                  value: data.sybName || ''
                }, {
                  label: '所属银行',
                  value: data.bankName || ''
                }, {
                  label: '所属地区',
                  value: data.shengName || ''
                }, {
                  label: '所属队长',
                  value: data.bmName || ''
                },
              ];
              if (this.objName === this.A_PROJ_NAME) { // A类产品不展示项目类数量和金额
                detail.shift();
                detail.shift();
              } else {
                detail.splice(2, 1); // 去掉A类产品的金额
              }
              this.reportList.push({
                name: `${(index + 1) + (this.page - 1) * PAGE_SIZE}. ${data.creator}`,
                sales: this.objName !== this.A_PROJ_NAME ? `${data.quantity || 0}件/套` : `￥${numberComma(data.aProduct || 0)}`,
                showContent: false,
                detail: detail
              })
            });
            this.curPage = this.page;
            this.isDisabled = this.reportList.length < PAGE_SIZE;
            this.$nextTick(() => {
              if (!this.rankScroll) {
                this.rankScroll = new BScroll(this.$refs.rankContainer, {click: true})
              }
              this.rankScroll.refresh();
              resolve();
            });
          }).catch(err => {
            this.showLoading = false;
            this.reportList = [];
            this.$vux.alert.show({
              content: err.message
            })
          })
        })
      },
      // TODO 获取项目列表
      getProj() {
        let proj = JSON.parse(sessionStorage.getItem(PROJ_LIST));
        proj.shift();
        this.projList = proj
      },
      // TODO 隐藏下拉框
      hideDropList() {
        this.showDate = false;
        this.showProj = false;
      },
      // TODO 点击本日、本周、本月、本年的页签
      dateClick() {
        this.showDate = !this.showDate;
        this.showProj = false;
      },
      // TODO 点击本日、本周、本月、本年的列表
      dateItemClick(item) {
        this.showDate = false;
        if (item.value === this.dateSelected.value) {
          return
        }
        this.dateSelected = item;
        this.assembleData();
        this.getTotal();
        if (this.objName === A_PROJ_NAME) {
          this.getReportSummary();
        }
      },
      // TODO 点击项目页签
      projClick() {
        this.showProj = !this.showProj;
        this.showDate = false;
      },
      // TODO 点击项目列表
      projItemClick(item, index) {
        this.showProj = false;
        if (item === this.objName) {
          return
        }
        this.objName = item;
        this.page = 1;
        this.assembleData();
        this.getTotal();
      },
      // TODO 点击A类产品页签
      aProjClick() {
        this.showProj = false;
        this.showDate = false;
        this.objName = this.A_PROJ_NAME;
        this.page = 1;
        this.assembleData();
        this.getTotal();
      },
      // TODO 返回上一页
      pagePrev() {
        if (this.page === 1) {
          return
        }
        this.page--;
        this.assembleData().then(() => {
          // 滚动到顶部
          this.rankScroll.scrollTo(0, 0);
        });
      },
      // TODO 进入下一页
      pageNext() {
        if (this.isDisabled) {
          return
        }
        this.page++;
        this.assembleData().then(() => {
          // 滚动到顶部
          this.rankScroll.scrollTo(0, 0);
        });
      },
      // TODO 获取合计，有日期过滤
      getTotal() {
        reportService.getTotalByDate(Object.assign(this.filterParams, this.getDate(this.dateSelected.value), {
          objName: this.objName
        })).then(data => {
          this.totalData = data.items;
          this.getTotalText();
        })
      },
      // TODO 生成合计栏文案
      getTotalText() {
        let totalData = this.totalData || [];
        let total = {};
        totalData.every(item => {
          if (item.objName && item.objName === this.objName) {
            total = item;
            return false
          }
          return true
        });
        if (this.objName === this.A_PROJ_NAME) { // A类产品展示金额，项目类产品展示数量
          this.totalText = `￥${numberComma(total.amount || 0)}（共${total.number || 0}人）`;
        } else {
          this.totalText = `${total.quantity || 0}件/套（共${total.number || 0}人）`;
        }
      },
      // TODO 获取报数汇总
      getReportSummary() {
        reportService.getReportSummary(this.getDate(this.dateSelected.value)).then(data => {
          this.summaryText = `${data.punchCardNumber || 0}人（共${data.salesmanNumber || 0}人）`;
        })
      },
      //  TODO 跳转到报数汇总页面
      goSummary() {
        // 存储时间选择
        sessionStorage.setItem(DATE_SELECTED, JSON.stringify(this.dateSelected));
        this.$router.push({
          path: '/reportsOp/reportsSummary',
          query: {
            dateSelected: this.dateSelected.value
          }
        })
      }
    },
    filters: {
      // TODO 项目类产品名称过滤
      nameFilter(val, vm) {
        if (val !== A_PROJ_NAME) {
          return val.length > 5 ? `${val.slice(0, 5)}...` : val;
        } else {
          return '项目类产品';
        }
      }
    },
    created() {
      let query = this.$route.query;
      let dateSelected = sessionStorage.getItem(DATE_SELECTED);
      // 设置筛选参数
      this.filterParams = {
        shengName: query.region ? decodeURI(query.region) : '', // 区域
        bankName: query.bank ? decodeURI(query.bank) : '', // 银行
        sybName: query.dept ? decodeURI(query.dept) : '', // 部门
        objName: query.proj ? decodeURI(query.proj) : '', // 项目
      };
      // 如果选择了项目，则修改选中页签
      if (this.filterParams.objName) {
        this.objName = this.filterParams.objName;
      }
      // 还原时间选择
      if (dateSelected) {
        this.dateSelected = JSON.parse(dateSelected);
        sessionStorage.removeItem(DATE_SELECTED)
      }
      this.getProj();
      this.assembleData();
      this.getTotal();
      this.getReportSummary();
    },
    mounted() {
      this.$nextTick(() => {
        if (!this.rankScroll) {
          this.rankScroll = new BScroll(this.$refs.rankContainer, {click: true})
        }
      })
    }
  }
</script>

<style lang="scss">
  .reports-container {
    overflow: hidden;
    .time_line {
      width: 100%;
      height: 40px;
      color: #fff;
      font-size: 20px;
      font-weight: 200;
      line-height: 40px;
      text-align: center;
      background: -webkit-linear-gradient(left top, rgba(36, 104, 236, 1), rgba(46, 213, 251, 1));
    }
    // 分页栏
    .page-controler {
      width: 100%;
      height: 40px;
      line-height: 40px;
      text-align: center;
      display: flex;
      position: absolute;
      bottom: 0;
      left: 0;
      // align-items: center;
    }
    .each-page {
      flex: 1;
      font-size: 18px;
      &.disabled {
        color: #ccc;
      }
    }
    // 顶部栏
    .select-part {
      width: 100%;
      height: 40px;
      line-height: 40px;
      display: flex;
      // background: -webkit-linear-gradient(left top, rgba(176, 140, 88, 1), rgba(228, 201, 152, 1));
      background: #5077AA;
    }
    .each-select {
      flex: 1;
      position: relative;
      text-align: center;
      font-size: 14px;
      color: #fff;
      font-weight: 200;
    }
    .title_right {
      position: absolute;
      right: 10px;
    }
    .date-list-container, .proj-list-container {
      position: absolute;
      top: 100%;
      left: 0;
      z-index: 5;
      width: 100%;
      max-height: 300px;
      color: #000;
      box-shadow: 1px 1px 5px #ccc;
      overflow: auto;
      -webkit-overflow-scrolling: touch;
      .weui-cells {
        margin-top: 0;
        .weui-cell {
          padding: 10px 5px;
          font-size: 14px;
        }
      }
      .vux-cell-bd {
        width: 100%;
      }
      .vux-label {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .selected {
        background-color: #5077AA;
        color: #fff;
      }
    }
    .each-select-name {
      padding: 6px 0;
    }
    // 选中时状态
    .is-selected {
      border-bottom: 2px solid #fff;
    }
    .total-group {
      .weui-cells {
        margin: 5px 0;
      }
    }
    .rank-container {
      height: calc(100% - 134px);
      overflow: hidden;
      /*-webkit-overflow-scrolling: touch;*/
      &.has-summary {
        height: calc(100% - 188px);
      }
      .weui-cell__ft {
        padding-right: 20px;
      }
      .no-data {
        position: absolute;
        top: 50%;
        margin: 0 40px;
      }
    }
    .rank-item .weui-cells {
      margin-top: 0;
    }
    .calendar-group .weui-cells {
      margin-top: 0;
    }
  }
</style>
