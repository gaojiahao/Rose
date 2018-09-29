<template>
  <div class="pages xsbj-list-conatiner" ref='list'>
    <div class='content'>
      <div class="list_top">
        <!-- 搜索栏 -->
        <searchIcon :filterList="filterList" @search="searchList"></searchIcon>
      </div>
      <r-scroll class="list_wrapper" :options="scrollOptions" :has-next="hasNext"
                :no-data="!hasNext && !listData.length" @on-pulling-up="onPullingUp" @on-pulling-down="onPullingDown"
                ref="bScroll">
        <div class="each_duty" :class="{visited: item.visited}" v-for="(item, index) in listData" :key="index" @click='goDetail(item, index)'>
          <!-- 订单编号, 时间 -->
          <div class="duty_top">
            <p class="duty_code">
              {{item.transCode}}
              <span class="duty_crt_man" :class="item.statusClass">{{item.biStatus}}</span>
            </p>
            <p class="duty_time">{{item.effectiveTime | dateFormat('YYYY-MM-DD')}}</p>
          </div>
          <!-- 项目 -->
          <div class="project_name">
            <div class="major_content vux-1px-b">
              <!-- <div class="status_part">
                <span class="iconfont icon-503020"></span>
                <span class="status_name">{{item.projectType_project}}</span>
              </div> -->
              {{item.projectName}}
            </div>
          </div>
          <!-- 项目计划经办人 -->
          <div class="order_count">
            <div class="handle_man">
              {{item.handlerName}}<span style="fontSize:.1rem;">[经办人]</span>
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
  import {getProjectPlanList} from 'service/projectService'
  import listCommon from 'pageMixins/bizListCommon'

  export default {
    data() {
      return {
        listStatus: [{name: '全部', status: ''}, {name: '已生效', status: '已生效'}, {name: '进行中', status: '进行中'}],
        listViewID: 2290,
        filterList: [ // 过滤列表
          {
            name: '交易号',
            value: 'transCode',
          }, {
            name: '经办人',
            value: 'handlerName',
          }, {
            name: '项目名称',
            value: 'projectName',
          },
        ],
      }
    },
    mixins: [listCommon],
    methods: {
      goDetail(item, index) {
        if (this.clickVisited) {
          return
        }
        // 交易号、应用名称等
        let { transCode } = item;
        let { code } = this.$route.params;
        let { name } = this.$route.query;
        let {file} = this.$route.query;
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
              transCode,
              file
            }
          })
        }, 200)
      },
      getList(noReset = false) {
        let filter = [];

        if (this.serachVal) {
          filter = [
            {
              operator: 'like',
              value: this.serachVal,
              property: this.filterProperty,
              // link: 'or',
            }
          ]
        }

        return getProjectPlanList({
          listViewID: this.listViewID,
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
  @import './../../scss/bizList';

  .xsbj-list-conatiner {
    .list_wrapper {
      height: calc(100% - .4rem);
    }
  }
</style>
