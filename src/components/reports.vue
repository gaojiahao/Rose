<template>
  <div class="pages">
    <group>
      <calendar @on-change="onChange" v-model="filterDate" title="时间段选择" popup-header-title="请选择时间段"
                disable-future></calendar>
    </group>
    <tab :line-width=2 active-color='#B99763' v-model="activeIndex" v-show="showTab">
      <tab-item class="vux-center" :selected="curTab === item" v-for="(item, index) in list5" :key="index"
                @click.native="onItemClick(index)">{{item}}
      </tab-item>
    </tab>
    <div class="ranking_part">
      <group id="ranking_group" v-for="( item,index ) in arr1" :key="index">
        <cell :value=item.sales :title=item.name is-link :border-intent="false"
              :arrow-direction="item.showContent ? 'up' : 'down'"
              @click.native="item.showContent = !item.showContent "></cell>
        <template v-if="item.showContent">
          <cell-form-preview :border-intent="true" :list="list"></cell-form-preview>
        </template>
      </group>
    </div>
  </div>
</template>

<script>
  import {Tab, Cell, Group, TabItem, Calendar, CellFormPreview} from 'vux'

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
        showContent001: false,
        filterDate: [],
        arr1:
          [
            {name: '托尼·斯塔克', sales: 400, showContent: false},
            {name: '托尔', sales: 300, showContent: false},
            {name: '布鲁斯·班纳', sales: 200, showContent: false},
            {name: '斯蒂夫·罗杰斯', sales: 100, showContent: false},
            {name: '娜塔莎·罗曼诺夫', sales: 600, showContent: false},
            {name: '克林特·巴顿', sales: 400, showContent: false},
            {name: '托尼·斯塔克', sales: 400, showContent: false},
            {name: '托尔', sales: 300, showContent: false},
            {name: '布鲁斯·班纳', sales: 200, showContent: false},
            {name: '斯蒂夫·罗杰斯', sales: 100, showContent: false},
            {name: '娜塔莎·罗曼诺夫', sales: 600, showContent: false},
            {name: '娜塔莎·罗曼诺夫', sales: 600, showContent: false},
            {name: '克林特·巴顿', sales: 400, showContent: false},
            {name: '托尼·斯塔克', sales: 400, showContent: false},
            {name: '托尔', sales: 300, showContent: false},
            {name: '布鲁斯·班纳', sales: 200, showContent: false},
            {name: '斯蒂夫·罗杰斯', sales: 100, showContent: false},
            {name: '娜塔莎·罗曼诺夫', sales: 600, showContent: false},
            {name: '娜塔莎·罗曼诺夫', sales: 600, showContent: false},
            {name: '克林特·巴顿', sales: 400, showContent: false},
            {name: '托尼·斯塔克', sales: 400, showContent: false},
            {name: '托尔', sales: 300, showContent: false},
            {name: '布鲁斯·班纳', sales: 200, showContent: false},
            {name: '斯蒂夫·罗杰斯', sales: 100, showContent: false},
            {name: '娜塔莎·罗曼诺夫', sales: 600, showContent: false},
            {name: '娜塔莎·罗曼诺夫', sales: 600, showContent: false},
            {name: '克林特·巴顿', sales: 400, showContent: false},
            {name: '托尼·斯塔克', sales: 400, showContent: false},
            {name: '托尔', sales: 300, showContent: false},
            {name: '布鲁斯·班纳', sales: 200, showContent: false},
            {name: '斯蒂夫·罗杰斯', sales: 100, showContent: false},
            {name: '娜塔莎·罗曼诺夫', sales: 600, showContent: false},
            {name: '克林特·巴顿', sales: 400, showContent: false}
          ],
        list: [{
          label: '项目类产品',
          value: '1xxx件/套'
        },
          {
            label: 'A类产品',
            value: '1xx件/套'
          },
          {
            label: 'B类产品',
            value: '2xx件/套'
          }, {
            label: '所在部门',
            value: 'xx事业部'
          }, {
            label: '所属银行',
            value: 'xx银行'
          }
        ],
        curTab: '本日',
        list5: list()
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
  }
</script>

<style>
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

  .ranking_part {
    /* margin-top: 4px; */
  }

  #ranking_group .weui-cells {
    margin-top: 0;
  }
</style>
