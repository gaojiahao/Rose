<template>
  <div class="pages reports-container">
    <group class="calendar-group" v-show="false">
      <calendar @on-change="onChange" v-model="filterDate" title="时间段选择" popup-header-title="请选择时间段"
                disable-future></calendar>
    </group>
    <tab :line-width=2 active-color='#B99763' v-model="activeIndex" v-show="showTab">
      <tab-item class="vux-center" :selected="curTab === item" v-for="(item, index) in tabList" :key="index"
                @click.native="onItemClick(index)">{{item}}
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
  import {Tab, Cell, Group, TabItem, Calendar, CellFormPreview} from 'vux'
  import reportService from '../service/reportService'

  const list = () => ['本日', '本周', '本月', '本年']
  export default {
    components: {
      Tab,
      Cell,
      Group,
      TabItem,
      Calendar,
      CellFormPreview
    },
    data() {
      return {
        showTab: true,
        activeIndex: 0,
        filterDate: [],
        reportList: [],
        list: [],
        curTab: '本日',
        tabList: list()
      }
    },
    methods: {
      onItemClick(index) {
        console.log(index);
      },
      onChange(val) {
        console.log(val);
        this.showTab = false
      }
    },
    created() {
      let reportListData = [
        {name: '托尼·斯塔克', sales: 400},
        {name: '托尔', sales: 300},
        {name: '布鲁斯·班纳', sales: 200},
        {name: '斯蒂夫·罗杰斯', sales: 100},
        {name: '娜塔莎·罗曼诺夫', sales: 600},
        {name: '克林特·巴顿', sales: 400},
        {name: '托尼·斯塔克', sales: 400},
        {name: '托尔', sales: 300},
        {name: '布鲁斯·班纳', sales: 200},
        {name: '斯蒂夫·罗杰斯', sales: 100},
        {name: '娜塔莎·罗曼诺夫', sales: 600},
        {name: '娜塔莎·罗曼诺夫', sales: 600},
        {name: '克林特·巴顿', sales: 400},
        {name: '托尼·斯塔克', sales: 400},
        {name: '托尔', sales: 300},
        {name: '布鲁斯·班纳', sales: 200},
        {name: '斯蒂夫·罗杰斯', sales: 100},
        {name: '娜塔莎·罗曼诺夫', sales: 600},
        {name: '娜塔莎·罗曼诺夫', sales: 600},
        {name: '克林特·巴顿', sales: 400},
        {name: '托尼·斯塔克', sales: 400},
        {name: '托尔', sales: 300},
        {name: '布鲁斯·班纳', sales: 200},
        {name: '斯蒂夫·罗杰斯', sales: 100},
        {name: '娜塔莎·罗曼诺夫', sales: 600},
        {name: '娜塔莎·罗曼诺夫', sales: 600},
        {name: '克林特·巴顿', sales: 400},
        {name: '托尼·斯塔克', sales: 400},
        {name: '托尔', sales: 300},
        {name: '布鲁斯·班纳', sales: 200},
        {name: '斯蒂夫·罗杰斯', sales: 100},
        {name: '娜塔莎·罗曼诺夫', sales: 600},
        {name: '克林特·巴顿', sales: 400}
      ]
      this.reportList = reportListData.map(item => {
        return Object.assign(item, {
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
              value: 'xx事业部'
            }, {
              label: '所属银行',
              value: 'xx银行'
            }
          ]
        })
      })
      reportService.getReport().then(data => {
        console.log(data)
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
