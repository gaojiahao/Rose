<template>
  <div class="pages xsbj-list-conatiner" :class="{'no-add': !action.add}" ref='list'>
    <div class='content'>
      <div class="list_top">
        <!-- 搜索栏 -->
        <searchIcon :filterList="filterList" @search="searchList"></searchIcon>
        <div class="filter_part">
          <r-sort @on-sort="onSortList"></r-sort>
        </div>
      </div>
      <r-scroll class="list_wrapper" :options="scrollOptions" :has-next="hasNext"
                :no-data="!hasNext && !listData.length" @on-pulling-up="onPullingUp" @on-pulling-down="onPullingDown"
                ref="bScroll">
        <!-- <div class="each_duty" :class="{visited: item.visited}" v-for="(item, index) in listData" :key="index" @click='goDetail(item, index)'>
          <div class="duty_top">
            <p class="duty_code">
              {{item.transCode}}
              <span class="duty_crt_man" :class="item.statusClass">{{item.biStatus}}</span>
            </p>
            <p class="duty_time">{{item.effectiveTime | dateFormat('YYYY-MM-DD')}}</p>
          </div>
          <div class="project_name">
            <div class="major_content vux-1px-b">
              <div class="status_part">
                <span class="iconfont icon-503020"></span>
                <span class="status_name">{{item.projectType}}</span>
              </div>
              {{item.projectName}}
            </div>
          </div>
          <div class="order_count">
            <div class="handle_man">
              {{item.handlerName}}<span style="fontSize:.1rem;">[经办人]</span>
            </div>
          </div>
        </div> -->
        <just-word-item :item="item" v-for="(item, index) in listData" :key="index" 
                        conutTitle="收入" @click.native="goDetail(item, index)"></just-word-item>
      </r-scroll>
    </div>
    <div class="btn vux-1px-t" v-if="action.add">
      <div class="cfm_btn" @click="goEdit">新增</div>
    </div>
  </div>
</template>

<script>
  import {getList} from 'service/commonService'
  import listCommon from 'pageMixins/bizListCommon'

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
          }, /*{
            name: '项目名称',
            value: 'projectName_project',
          }, */
        ],
        listViewID: 2331,
      }
    },
    mixins: [listCommon],
    methods: {
      goDetail(item, index) {
        if (this.clickVisited) {
          return
        }
        // 交易号、应用名称等
        let { transCode } = item,
            { name } = this.$route.query,
            { fileId, listId } = this.$route.params;
        // 高亮 点击过的数据
        this.clickVisited = true;
        item.visited = true;
        this.$set(this.listData, index, {...item});
        // 等待动画结束后跳转
        setTimeout(() => {
          this.clickVisited = false;
          this.$router.push({
            path: `/detail/${fileId}/${listId}`,
            query: { name, transCode }
          })
        }, 200)
      },
      // getList(noReset = false) {
      //   let filter = [];
      //   if (this.serachVal) {
      //     filter = [
      //       ...filter,
      //       {
      //         operator: 'like',
      //         value: this.serachVal,
      //         property: 'transCode',
      //         attendedOperation: 'or'
      //       }, {
      //         operator: 'like',
      //         value: this.serachVal,
      //         property: 'handlerName',
      //       },
      //     ];
      //   }
      //   return getList(2331, {
      //     limit: this.limit,
      //     page: this.page,
      //     start: (this.page - 1) * this.limit,
      //     filter: JSON.stringify(filter),
      //     sort: JSON.stringify(this.sort),
      //   }).then(({dataCount = 0, tableContent = []}) => {
      //     this.$emit('input', false);
      //     tableContent.forEach(item => {
      //       this.setStatus(item);
      //     });
      //     this.hasNext = dataCount > (this.page - 1) * this.limit + tableContent.length;
      //     this.listData = this.page === 1 ? tableContent : this.listData.concat(tableContent);
      //     if (!noReset) {
      //       this.$nextTick(() => {
      //         this.resetScroll();
      //       })
      //     }
      //   }).catch(e => {
      //     this.resetScroll();
      //   })
      // }
    }
  }
</script>

<style lang='scss' scoped>
  @import './../../scss/bizList';
</style>
