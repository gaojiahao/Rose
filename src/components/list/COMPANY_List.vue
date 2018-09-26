<template>
  <div class="pages" ref='list'>
    <div class="content">
      <div class="list_top">
        <!-- 搜索栏 -->
        <searchIcon :filterList="filterList" @search="searchList"></searchIcon>
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
        <div class="each_duty" :class="{visited: item.visited}" v-for="(item, index) in listData" :key="index"
             @click='goDetail(item, index)'>
             {{item.groupName}}
          <!-- 订单编号, 时间 -->
          <!-- <div class="duty_top">
            <p class="duty_code">
              {{item.transCode}}
              <span class="duty_crt_man" :class="item.statusClass">{{item.biStatus}}</span>
            </p>
            <p class="duty_time">{{item.effectiveTime | dateFormat('YYYY-MM-DD')}}</p>
          </div> -->
          <!-- 项目名称 -->
          <!-- <div class="project_name">
            <div class="major_content vux-1px-b">
              <div class="status_part">
                <span class="iconfont icon-503020"></span>
                <span class="status_name">{{item.projectType_project}}</span>
              </div>
              <div>{{item.projectName_project}}</div>
              <div class="content_step">
                <div>
                  {{item.projectManager_project}}<span class="symbol">[项目经理]</span>
                </div>
                <div>
                  利润率: {{item.budgetProfitMargin_project | percent}}
                </div>
              </div>
            </div>
          </div> -->
          <!-- 项目立项经办人 -->
          <!-- <div class="order_count">
            <div class="handle_man">
              {{item.handlerName}}<span style="fontSize:.1rem;">[经办人]</span>
            </div>
            <div class="money_part">
              <span class="num">收入:</span>
              <span class="money">
                <span style="fontSize:.1rem;">￥</span>{{item.budgetIncome_project | toFixed | numberComma}}
              </span>
            </div>
          </div> -->
        </div>      
      </r-scroll>
    </div>
    <div class="btn vux-1px-t" v-if="!chartShow">
      <div class="cfm_btn" @click="goEdit">新增</div>
    </div>  
  </div>
</template>

<script>
import listCommon from './../mixins/bizListCommon'
import { getCompany } from 'service/listService'
export default {
  mixins: [listCommon],
  data(){
    return{
      listStatus: [ {name: '全部', status: ''}, {name: '使用中', status: '1'}, {name: '未使用', status: '2'}, {name: '停用', status: '-1'}],
      // 过滤列表
      filterList: [ 
        {
          name: '公司名称',
          value: 'groupName',
        }, {
          name: '公司简称',
          value: 'groupShortName',
        }
      ],    
    }
  },
  methods: {
    ///tab切换
    tabClick(item, index) {
      this.activeIndex = index;
      this.activeTab = item.status;
      this.resetCondition();
      this.getList();
    },      
    goDetail(item, index) {
      if (this.clickVisited) {
        return
      }
      // 交易号、应用名称等
      let { transCode } = item;
      let { code } = this.$route.params;
      let { name } = this.$route.query;
      // 高亮 点击过的数据
      this.clickVisited = true;
      item.visited = true;
      this.$set(this.listData, index, {...item});
      // 等待动画结束后跳转
      setTimeout(() => {
        this.clickVisited = false;
        this.$router.push({
          path: `/detail/${code}`,
          query: {
            name,
            transCode
          }
        })
      }, 200)
    },
    getList(noReset = false) {
      let filter = [];
      if (this.activeTab) {
        filter = [{
          operator: "in",     //模糊查询like，精确查询eq
          property: "status",
          value: this.activeTab
        }]
      }        
      if (this.serachVal) {
        filter = [
          ...filter,
          {
            operator: "like",
            value: this.serachVal,
            property: this.filterProperty,
          },
        ];
      }
      return getCompany({
        limit: this.limit,
        page: this.page,
        start: (this.page - 1) * this.limit,
        filter: JSON.stringify(filter)
      }).then(({dataCount = 0, tableContent = []}) => {
        this.$emit('input', false);
        tableContent.forEach(item => {
          this.setStatus(item);
        });
        this.hasNext = dataCount > (this.page - 1) * this.limit + tableContent.length;
        this.listData = this.page === 1 ? tableContent : this.listData.concat(tableContent);
        if (!noReset) {
          this.$nextTick(() => {
            this.resetScroll();
          })
        }
        this.$loading.hide();
      }).catch(e => {
        this.resetScroll();
      })
    }
  }
  
}
</script>

<style lang='scss' scoped>
@import './../scss/bizList';
</style>
