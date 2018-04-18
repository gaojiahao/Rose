<template>
  <div class="pages reports-container">
    <group class="calendar-group" v-show="false">
      <calendar @on-change="onChange" v-model="filterDate" title="时间段选择" popup-header-title="请选择时间段"
                disable-future></calendar>
    </group>
    <div class="select-part">
      <div class="each-select vux-1px-r" @click="dateClick">
        <div>
          <span class="each-select-name">{{dateSelected.name}}</span><i class="iconfont icon-xiaosanjiaodown"></i>
        </div>
        <group class="date-list-container" v-show="showDate">
          <cell :title="item.name" v-for="(item, index) in dateList" :key="index"
                @click.native.stop="dateItemClick(item)" :class="{selected: item.name === dateSelected.name}"></cell>
        </group>
      </div>
      <div class="each-select vux-1px-r" @click="projClick">
        <div>
          <span class="each-select-name" :class="{'is-selected': tabSelected === 'Other'}">项目类产品</span>
          <i class="iconfont icon-xiaosanjiaodown"></i>
        </div>
        <group class="proj-list-container" v-show="showProj">
          <cell :title="item" v-for="(item, index) in projList" :key="index"
                @click.native.stop="projItemClick(item)" :class="{selected: item === projSelected}"></cell>
        </group>
      </div>
      <div class="each-select " @click="aProjClick">
        <span class="each-select-name" :class="{'is-selected': tabSelected === 'AProj'}">A类产品</span>
      </div>
    </div>
    <!-- <grid>
      <grid-item label="项目类产品"></grid-item>
      <grid-item label="A类产品"></grid-item>
    </grid> -->
    <!-- <tab :line-width=2 active-color='#B99763' v-model="activeIndex" v-show="showTab">
      <tab-item class="vux-center" :selected="curTab === item.value" v-for="(item, index) in dateList" :key="index"
                @click.native="onItemClick(item)">{{item.name}}
      </tab-item>
    </tab> -->

    <div class="rank-container" @click="hideDropList">
      <group class="rank-item" v-for="( item,index ) in reportList" :key="index">
        <cell :value=item.sales :title=item.name is-link :border-intent="false"
              :arrow-direction="item.showContent ? 'up' : 'down'"
              @click.native="item.showContent = !item.showContent"></cell>
        <div v-show="item.showContent">
          <cell-form-preview :border-intent="true" :list="item.detail"></cell-form-preview>
        </div>
      </group>
      <divider v-show="reportList.length === 0">暂无数据</divider>
    </div>
  </div>
</template>

<script>
  import {
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
    numberComma
  } from 'vux'
  import reportService from '../service/reportService'
  import saleReportService from '../service/saleRepotService'

  const PROJ_LIST = 'ROSE_PROJ_LIST'
  export default {
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
      Divider
    },
    data() {
      return {
        showTab: true,
        activeIndex: 0,
        filterDate: [],
        reportList: [],
        list: [],
        curTab: 'days',
        dateList: [
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
        ],
        reportData: { // 获取的后台数据
          days: [],
          weeks: [],
          months: [],
          years: []
        },
        filterParams: {}, // 过滤条件
        showDate: false,
        dateSelected: { // 选中的日期
          name: '本日',
          value: 'days'
        },
        showProj: false,
        projList: [],
        projSelected: '项目类产品',
        tabSelected: 'AProj',
        page: 1
      }
    },
    methods: {
      onItemClick(item) {
        this.curTab = item.value
        this.reportList = this.reportData[item.value]
      },
      onChange(val) {
        console.log(val);
        // this.showTab = false
      },
      // TODO 重置reportData的数据
      resetReportData() {
        this.reportData = {
          days: [],
          weeks: [],
          months: [],
          years: []
        }
      },
      // TODO 组装数据
      assembleData(params = {}) {
        reportService.getReport(params).then(data => {
          this.resetReportData()
          let map = ['days', 'weeks', 'months', 'years']
          // 数据组装
          map.forEach(item => {
            data[item].forEach((data, index) => {
              let detail = [
                {
                  label: '项目类产品',
                  value: `${data.qty || 0}件/套`
                },
                {
                  label: 'A类产品',
                  value: `￥${numberComma(data.aProduct)}`
                },
                /*{
                  label: 'B类产品',
                  value: '￥999'
                }, */{
                  label: '所在部门',
                  value: data.bmName
                }, {
                  label: '所属银行',
                  value: data.bankName
                }
              ]
              if (this.tabSelected === 'AProj') {
                detail.shift()
              }
              this.reportData[item].push({
                name: `${index + 1}. ${data.creator}`,
                sales: '',
                showContent: false,
                detail: detail
              })
            })
          })
          this.reportList = this.reportData[this.dateSelected.value]
        })
      },
      // TODO 获取项目列表
      getProj() {
        let proj = JSON.parse(sessionStorage.getItem(PROJ_LIST))
        proj.shift()
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
        this.dateSelected = item;
        this.reportList = this.reportData[item.value];
      },
      // TODO 点击项目页签
      projClick() {
        this.showProj = !this.showProj;
        this.showDate = false;
      },
      // TODO 点击项目列表
      projItemClick(item) {
        this.showProj = false;
        this.tabSelected = 'Other';
        this.projSelected = item;
        this.assembleData(Object.assign(this.filterParams, {
          objName: item
        }))
      },
      // TODO 点击A类产品页签
      aProjClick() {
        this.showProj = false;
        this.showDate = false;
        this.tabSelected = 'AProj';
        this.projSelected = '项目类产品';
        this.assembleData(Object.assign(this.filterParams, {
          objName: ''
        }));
      }
    },
    created() {
      let query = this.$route.query
      this.filterParams = {
        sybName: query.region || '', // 区域
        bankName: query.bank || '', // 银行
        bmName: query.dept || '', // 部门
        objName: query.proj || '', // 项目
      }
      // 如果选择了项目，则修改选中页签
      if (this.filterParams.objName) {
        this.tabSelected = 'Other'
        this.projSelected = this.filterParams.objName;
      }
      this.assembleData(this.filterParams)
      this.getProj()
    }
  }
</script>

<style lang="scss">
  .reports-container {
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
    // 顶部栏
    .select-part {
      width: 100%;
      height: 40px;
      line-height: 40px;
      display: flex;
      background: -webkit-linear-gradient(left top, rgba(176, 140, 88, 1), rgba(228, 201, 152, 1));
    }
    .each-select {
      flex: 1;
      text-align: center;
      font-size: 14px;
      color: #fff;
      font-weight: 200;
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
      .weui-cells {
        margin-top: 0;
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
        background: -webkit-linear-gradient(left top, #b08c58, #e4c998);
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
    .rank-container {
      height: calc(100% - 40px);
      overflow: auto;
      -webkit-overflow-scrolling: touch;
    }
    .rank-item .weui-cells {
      margin-top: 0;
    }
    .calendar-group .weui-cells {
      margin-top: 0;
    }
  }
</style>
