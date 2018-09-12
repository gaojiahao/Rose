<template>
  <div class="pages xmlx-list-container" ref='list'>
    <div class='content'>
      <div class="list_top">
        <!-- 搜索栏 -->
        <searchIcon :filterList="filterList" @search="searchList"></searchIcon>
      </div>
      <r-scroll class="list_wrapper" :options="scrollOptions" :has-next="hasNext"
                :no-data="!hasNext && !listData.length" @on-pulling-up="onPullingUp" @on-pulling-down="onPullingDown"
                ref="bScroll">
        <div class="each_duty" :class="{visited: item.visited}" v-for="(item, index) in listData" :key="index"
             @click='goDetail(item, index)'>
          <!-- 订单编号, 时间 -->
          <div class="duty_top">
            <p class="duty_code">
              {{item.transCode}}
              <span class="duty_crt_man" :class="item.statusClass">{{item.biStatus}}</span>
            </p>
            <p class="duty_time">{{item.effectiveTime | dateFormat('YYYY-MM-DD')}}</p>
          </div>
          <!-- 项目名称 -->
          <div class="duty_name">
            <div class="major_content">
              <div class="status_part">
                <span class="iconfont icon-503020"></span>
                <span class="status_name">{{item.projectType_project}}</span>
              </div>
              {{item.projectName_project}}
            </div>
            <div class="content_step vux-1px-b">
              <div>
                {{item.projectManager_project}}<span class="symbol">[项目经理]</span>
              </div>
              <div>
                利润率: {{item.budgetProfitMargin_project | percent}}
              </div>
            </div>
          </div>
          <!-- 项目立项经办人 -->
          <div class="order_count">
            <div class="handle_man">
              {{item.handlerName}}<span style="fontSize:.1rem;">[经办人]</span>
            </div>
            <div class="money_part">
              <span class="num">收入:</span>
              <span class="money">
                <span style="fontSize:.1rem;">￥</span>{{item.budgetIncome_project | toFixed | numberComma}}
              </span>
            </div>
          </div>
        </div>
      </r-scroll>
    </div>
    <div class="btn vux-1px-t">
      <div class="cfm_btn" @click="goEdit">新增</div>
    </div>
  </div>
</template>

<script>
  import {getList} from 'service/commonService'
  import listCommon from './../mixins/bizListCommon'
  // 方法引入
  import {accMul} from '@/home/pages/maps/decimalsAdd'
  export default {
    data() {
      return {
        listStatus: [{name: '全部', status: ''}, {name: '已生效', status: '已生效'}, {name: '进行中', status: '进行中'}],
        filterList: [ // 过滤列表
          {
            name: '交易号',
            value: 'transCode',
          }, {
            name: '经办人',
            value: 'handlerName',
          },/* {
            name: '项目类型',
            value: 'projectType_project',
          }, {
            name: '项目名称',
            value: 'projectName_project',
          }, */
        ],
      }
    },
    mixins: [listCommon],
    filters:{
      // TODO 转为百分比
      percent(val) {
        if (!val && val !== 0) {
          return '无';
        }
        let budget = accMul(val,100);
        return `${budget}%`;
      },
    },
    methods: {
      goDetail(item, index) {
        if (this.clickVisited) {
          return
        }
        this.clickVisited = true;
        item.visited = true;
        this.$set(this.listData, index, {...item});
        let {code} = this.$route.params;
        // 等待动画结束后跳转
        setTimeout(() => {
          this.clickVisited = false;
          this.$router.push({
            path: `/detail/${code}`,
            query: {
              transCode: item.transCode
            }
          })
        }, 200)
      },
      getList(noReset = false) {
        let filter = [];

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

        return getList(2301, {
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
      },
    },
    created() {
    }
  }
</script>

<style lang='scss' scoped>
  @import './../scss/bizList';

  .xmlx-list-container {
    .list_wrapper {
      height: calc(100% - .4rem);
    }
    .project_name {
      padding: 0 .1rem;
      line-height: .24rem;
    }
    .content_step {
      display: flex;
      font-size: .12rem;
      align-items: center;
      padding: .02rem 0 .04rem;
      justify-content: space-between;
      color:#7d7d7d;
    }
  }
</style>
