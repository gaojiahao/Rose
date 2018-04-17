<template>
  <div class="pages reports-container">
    <group class="calendar-group" v-show="false">
      <calendar @on-change="onChange" v-model="filterDate" title="时间段选择" popup-header-title="请选择时间段"
                disable-future></calendar>
    </group>
    <grid>
      <grid-item label="项目类产品"></grid-item>
      <grid-item label="A类产品"></grid-item>
    </grid>
    <tab :line-width=2 active-color='#B99763' v-model="activeIndex" v-show="showTab">
      <tab-item class="vux-center" :selected="curTab === item.value" v-for="(item, index) in tabList" :key="index"
                @click.native="onItemClick(item)">{{item.name}}
      </tab-item>
    </tab>
    <div class="rank-container">
      <group class="rank-item" v-for="( item,index ) in reportList" :key="index">
        <cell :value=item.sales :title=item.name is-link :border-intent="false"
              :arrow-direction="item.showContent ? 'up' : 'down'"
              @click.native="item.showContent = !item.showContent"></cell>
        <div v-show="item.showContent">
          <cell-form-preview :border-intent="true" :list="item.detail"></cell-form-preview>
        </div>
      </group>
    </div>
  </div>
</template>

<script>
  import {Tab, Cell, Group, TabItem, Calendar, CellFormPreview, Grid, GridItem, PopupPicker} from 'vux'
  import reportService from '../service/reportService'

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
      PopupPicker
    },
    data() {
      return {
        showTab: true,
        activeIndex: 0,
        filterDate: [],
        reportList: [],
        list: [],
        curTab: 'days',
        tabList: [
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
        reportData: {
          days: [],
          weeks: [],
          months: [],
          years: []
        }
      }
    },
    methods: {
      onItemClick(item) {
        this.curTab = item.value
        this.reportList = this.reportData[item.value]
      },
      onChange(val) {
        console.log(val);
        this.showTab = false
      },
      // TODO 组装数据
      assembleData(params = {}) {
        reportService.getReport(params).then(data => {
          let map = ['days', 'weeks', 'months', 'years']
          // 数据组装
          map.forEach(item => {
            data[item].forEach(data => {
              this.reportData[item].push({
                name: data.creator,
                sales: '',
                showContent: false,
                detail: [
                  {
                    label: '项目类产品',
                    value: '1xxx件/套'
                  },
                  {
                    label: 'A类产品',
                    value: '￥999'
                  },
                  {
                    label: 'B类产品',
                    value: '￥999'
                  }, {
                    label: '所在部门',
                    value: data.bmName
                  }, {
                    label: '所属银行',
                    value: data.bankName
                  }
                ]
              })
            })
          })
          this.reportList = this.reportData.days
        })
      }
    },
    created() {
      let query = this.$route.query
      console.log(query)
      this.assembleData({
        sybName: query.region || '', // 区域
        bankName: query.bank || '', // 银行
        bmName: query.dept || '', // 部门
        objName: query.proj || '', // 项目
      })
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
    .rank-container {
      height: calc(100% - 44px);
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
