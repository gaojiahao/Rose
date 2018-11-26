<template>
  <div class="pages" :class="{'no-add': !action.add}" ref='list'>
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
        <div class="client_ads vux-1px-b" :class="{visited: item.visited}" v-for="(item, index) in listData" :key="index"
             @click='goDetail(item, index)'>
            <div class="cp_info user_info">
              <div class="cp_name">
                <span>{{item.groupName}}</span>
                <span>(简称: {{item.groupShortName}})</span>
              </div>
              <p class="cp_ads">{{item.companyType}}</p>
            </div>
            <span class="iconfont icon-bianji" @click.stop="EditCompany(item, index)" v-if="action.update"></span>
        </div>
      </r-scroll>
    </div>
    <div class="btn vux-1px-t" v-if="action.add">
      <div class="cfm_btn" @click="goEdit">新增</div>
    </div>
  </div>
</template>

<script>
// 接口引入
import { getCompany } from 'service/Directorys/companyService'
// mixin引入
import listCommon from 'pageMixins/bizListCommon'
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
    // tab切换
    tabClick(item, index) {
      this.activeIndex = index;
      this.activeTab = item.status;
      this.resetCondition();
      this.getList();
    },
    RouterChange(item, index, path){
      if (this.clickVisited) {
        return
      }
      // 交易号、应用名称等
      let { groupId } = item,
          { name } = this.$route.query;
      // 高亮 点击过的数据
      this.clickVisited = true;
      item.visited = true;
      this.$set(this.listData, index, {...item});
      // 等待动画结束后跳转
      setTimeout(() => {
        this.clickVisited = false;
        this.$router.push({
          path, query: { name, groupId }
        })
      }, 200)
    },
    // 编辑
    EditCompany(item, index){
      let { fileId, listId } = this.$route.params;
      this.RouterChange(item, index, `/fillForm/${fileId}/${listId}`);
    },
    // 前往详情
    goDetail(item, index) {
      let { fileId, listId } = this.$route.params;
      this.RouterChange(item, index, `/detail/${fileId}/${listId}`);
    },
    getList(noReset = false) {
      let filter = [];
      // 按时间排序
      let sort = [{
        property: "crtTime",
        direction: "DESC"
      }]
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
        sort: JSON.stringify(sort),
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
@import './../../scss/bizList';
</style>
