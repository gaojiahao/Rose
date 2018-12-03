<template>
  <div class="pages xmlx-list-container" :class="{'no-add': !action.add}" ref='list'>
    <div class='content'>
      <div class="list_top">
        <!-- 搜索栏 -->
        <searchIcon :filterList="filterList" @search='searchList' ref="search"></searchIcon>
        <div class="filter_part">
          <r-sort @on-sort="onSortList" @on-filter="onFilter" :view-id="listViewID" ref="sort"></r-sort>
          <r-tab @on-click="onTabClick"></r-tab>
        </div>
      </div>
      <r-scroll class="list_wrapper" :options="scrollOptions" :has-next="hasNext"
                :no-data="!hasNext && !listData.length" @on-pulling-up="onPullingUp" @on-pulling-down="onPullingDown"
                ref="bScroll">
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
          }, {
            name: '项目名称',
            value: 'projectName_project',
          },
        ],
        listViewID: 2301,
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
    }
  }
</script>

<style lang='scss' scoped>
  @import './../../scss/bizList';

  .xmlx-list-container {
    .project_name {
      padding: 0 .1rem;
    }
    .content_step {
      display: flex;
      font-size: .12rem;
      align-items: center;
      // padding: .02rem 0 .04rem;
      justify-content: space-between;
      color:#7d7d7d;
    }
  }
</style>
