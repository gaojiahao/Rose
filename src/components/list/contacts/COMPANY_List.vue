<template>
  <div class="pages" :class="{'no-add': !action.add}" ref='list'>
    <div class="content">
      <div class="list_top">
        <!-- 搜索栏 -->
        <searchIcon :filterList="filterList" @search="searchList"></searchIcon>
        <div class="filter_part">
          <tab :line-width='2' default-color='#333' active-color='#3296FA'>
            <tab-item v-for="(item, index) in listStatus" :key="index" :selected="index === activeIndex"
                      @on-item-click="tabClick(item, index)">{{item.name}}
            </tab-item>
          </tab>
        </div>
      </div>
      <r-scroll class="list_wrapper" :options="scrollOptions" :has-next="hasNext"
                :no-data="!hasNext && !listData.length" @on-pulling-up="onPullingUp" @on-pulling-down="onPullingDown"
                ref="bScroll">
        <div class="list-item-wrapper" :class="{visited: item.visited}" v-for="(item, index) in listData" :key="index"
             @click='goDetail(item, index)'>
          <img class="list_item_img" :src="item.groupPic" alt="company-img" @error="getDefaultImg(item)">
          <div class="list_info_wrapper">
            <div class="list_header">
              <span class="list_name">{{item.groupName}}</span>
              <span class="list_status" :class="item.statusClass">{{item.status}}</span>
            </div>
            <div class="list_detail">
              <div class="list_detail_item">
                <span class="list_detail_title">简称: </span>
                <span class="list_detail_value">{{item.groupShortName}}</span>
              </div>
              <div class="list_detail_item">
                <span class="list_detail_title">公司类型: </span>
                <span class="list_detail_value">{{item.companyType}}</span>
              </div>
            </div>
          </div>
        </div>
      </r-scroll>
    </div>
    <add-btn :action="action" :goEdit="goEdit"></add-btn>
  </div>
</template>

<script>
  // 接口引入
  import {getCompany} from 'service/Directorys/companyService'
  // mixin引入
  import listCommon from 'mixins/bizListCommon'

  export default {
    mixins: [listCommon],
    data() {
      return {
        listStatus: [{name: '全部', status: ''}, {name: '使用中', status: '1'}, {name: '未使用', status: '2'}, {
          name: '停用',
          status: '-1'
        }],
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
      RouterChange(item, index, path) {
        if (this.clickVisited) {
          return
        }
        // 交易号、应用名称等
        let {groupId} = item,
          {name} = this.$route.query;
        // 高亮 点击过的数据
        this.clickVisited = true;
        item.visited = true;
        this.$set(this.listData, index, {...item});
        // 等待动画结束后跳转
        setTimeout(() => {
          this.clickVisited = false;
          this.$router.push({
            path, query: {name, groupId}
          })
        }, 200)
      },
      // 编辑
      // EditCompany(item, index) {
      //   let {folder, fileName} = this.$route.params;
      //   this.RouterChange(item, index, `/fillForm/${folder}/${fileName}`);
      // },
      // 前往详情
      goDetail(item, index) {
        let {folder, fileName} = this.$route.params;
        this.RouterChange(item, index, `/detail/${folder}/${fileName}`);
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
            let status = ['', '使用中', '未使用', '草稿'];
            item.status = status[item.status] || '停用';
            this.setStatus(item);
            item.groupPic = item.groupPic ? item.groupPic : this.getDefaultImg();
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
      // 设置状态的class
      setStatus(item) {
        switch (item.status) {
          case '使用中':
            item.statusClass = 'duty_done_c';
            break;
          default:
            item.statusClass = 'duty_fall_c';
        }
      },
      // 获取默认图片
      getDefaultImg(item) {
        let url = require('assets/default/company.png');
        if (item) {
          item.groupPic = url;
        }
        return url
      },
    }

  }
</script>

<style lang='scss' scoped>
  @import '~scss/biz-app/bizList';
  @import '~@/scss/color';

  %ellipsis {
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }

  /* 没有新增 */
  .no-add {
    .content {
      height: 100%;
    }
  }

  .content {
    height: calc(100% - .78rem);
    overflow: auto;
    .list_wrapper {
      height: calc(100% - .96rem);
    }
  }

  .list-item-wrapper {
    display: flex;
    margin: .1rem;
    padding: .15rem;
    width: calc(100% - .2rem);
    border-radius: 4px;
    background-color: #fff;
    color: #333;
    transition: background-color 200ms linear;
    box-sizing: border-box;
    box-shadow: 0 2px 10px 0 rgba(228, 228, 232, 0.5);
    &.visited {
      background-color: $list_visited;
    }
    .duty_done_c {
      color: #333;
    }
    .duty_fall_c {
      color: #999;
    }

    .list_item_img {
      width: .5rem;
      height: .5rem;
      border-radius: .04rem;
    }

    .list_info_wrapper {
      flex: 1;
      margin-left: .13rem;
    }
    .list_header {
      display: flex;
      justify-content: space-between;
      .list_name {
        line-height: .14rem;
        font-size: .14rem;
        font-weight: 600;
      }
      .list_status {
        line-height: .12rem;
        font-size: .12rem;
      }
    }
    .list_detail {
      display: flex;
      margin-top: .12rem;
      line-height: .12rem;
      font-size: .12rem;
    }
    .list_detail_item {
      @extend %ellipsis;
      max-width: 1.5rem;
      & + .list_detail_item {
        margin-left: .13rem;
      }
    }
    .list_detail_title {
      color: #999;
    }
  }
</style>
