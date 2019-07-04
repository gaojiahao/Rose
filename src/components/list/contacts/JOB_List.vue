<template>
  <div class="pages" :class="{'no-add': !action.add}" ref='list'>
    <div class='content'>
      <div class="list_top">
        <!-- 搜索栏 -->
        <searchIcon @search='searchList'></searchIcon>
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
        <div class="list-item-wrapper" :class="{visited: item.visited, 'vux-1px-b': index !== listData.length - 1}"
             v-for="(item, index) in listData" :key="index" @click='goDetail(item, index)'>
          <i class="icon-job"></i>
          <div class="list_info_wrapper">
            <div class="list_detail">
              <div class="list_name">{{item.name}}</div>
              <div class="list_detail_item">
                <span class="list_detail_title">职位类型: </span>
                <span class="list_detail_value">{{item.changeType}}</span>
              </div>
            </div>
            <div class="list_status" :class="item.statusClass">{{item.status}}</div>
            <i class="icon-right"></i>
          </div>
        </div>
      </r-scroll>
    </div>
    <add-btn :action="action" :goEdit="goEdit"></add-btn>
  </div>
</template>

<script>
// vux 引入
import { Tab, TabItem } from 'vux'
// 接口 引入
import { getJobList } from 'service//Directorys/jobService'
// mixins 引入
import listCommon from 'mixins/bizListCommon'

export default {
  mixins: [listCommon],
  components: { Tab, TabItem },
  data() {
    return {
      filterList: [{ name: '职位名称', value: 'name' }],
      listStatus: [
        { name: '全部', status: '' },
        { name: '管理类', status: 'M' },
        { name: '营销类', status: 'Y' },
        { name: '技术类', status: 'J' },
        { name: '专业类', status: 'Z' },
        { name: '操作类', status: 'C' },
      ],
      biStatus: '',
      activeName: '',
    }
  },
  methods: {
    //获取销售订单数据
    getList(noReset = false) {
      let filter = [];
      if (this.activeTab.length) {
        filter = [{operator: "in", value: this.activeTab, property: "type"}];
      }
      if (this.serachVal) {
        filter = [
          ...filter,
          {
            operator: "like",
            value: this.serachVal,
            property: 'name',
          },
        ];
        if (this.activeTab.length) {
          filter[0].attendedOperation = "and";
        }
      }
      return getJobList({
        limit: this.limit,
        page: this.page,
        start: (this.page - 1) * this.limit,
        filter: JSON.stringify(filter),
        sort: JSON.stringify([{property: "crtTime", direction: "DESC"}])
      }).then(({dataCount = 0, tableContent = []}) => {
        this.hasNext = dataCount > (this.page - 1) * this.limit + tableContent.length;
        tableContent.forEach(item => {
          let status = ['', '使用中', '未使用', '草稿'];
          item.status = status[item.status] || '停用';
          this.setStatus(item);
          switch (item.type) {
            case 'Y':
              item.changeType = '营销类';
              break;
            case 'Z':
              item.changeType = '专业类';
              break;
            case 'J':
              item.changeType = '技术类';
              break;
            case 'C':
              item.changeType = '操作类';
              break;
            case 'M':
              item.changeType = '管理类';
              break;

          }
        });
        this.listData = this.page === 1 ? tableContent : this.listData.concat(tableContent);
        if (!noReset) {
          this.$nextTick(() => {
            this.resetScroll();
          })
        }
        //判断最近有无新增数据
        let text = '';
        if (noReset && this.activeIndex === 0) {
          if (this.total) {
            text = dataCount - this.total === 0 ? '暂无新数据' : text = `新增${dataCount - this.total}条数据`;
            this.$vux.toast.show({
              text: text,
              position: 'top',
              width: '50%',
              type: "text",
              time: 700
            })
          }
        }
        //列表总数据缓存
        if (this.activeIndex === 0 && this.page === 1) {
          sessionStorage.setItem(this.applyCode, dataCount);
        }
        this.$loading.hide();
      }).catch(e => {
        this.resetScroll();
      })
    },
    goNextPage(item, index, path) {
      if (this.clickVisited) {
        return
      }
      // 交易号、应用名称等
      let {name, listId} = this.$route.query,
          {folder, fileName} = this.$route.params;
      // 高亮点击的列表
      this.clickVisited = true;
      item.visited = true;
      this.$set(this.listData, index, {...item});
      // 新的路由地址
      let newPath = `${path}/${folder}/${fileName}`;
      setTimeout(() => {
        this.clickVisited = false;
        this.$router.push({
          path: newPath,
          query: {
            name, 
            listId,
            id: item.id
          }
        });
      }, 200);
    },
    goDetail(item, index) {
      this.goNextPage(item, index, '/detail')
    },
    // tab切换
    tabClick(item, index) {
      this.activeIndex = index;
      this.activeTab = item.status;
      this.activeName = item.name === '全部' ? '' : item.name;
      this.resetCondition();
      this.getList();
    },
    // 新增
    goEdit() {
      let { name,folder, fileName } = this.$route.query,
          { listId } = this.$route.params;
      this.$router.push({
        path: `/fillform/${listId}/${fileName}`,
        query: {
          name, 
          folder, fileName,
          jobType: this.activeName
        }
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
  }
}
</script>

<style lang="scss" scoped>
  @import "~scss/biz-app/bizList.scss";
  @import '~@/scss/color';

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
    padding: .15rem .33rem .15rem .15rem;
    width: 100%;
    border-radius: 4px;
    background-color: #fff;
    color: #333;
    transition: background-color 200ms linear;
    box-sizing: border-box;
    &.visited {
      background-color: $list_visited;
    }
    .duty_done_c {
      color: #333;
    }
    .duty_fall_c {
      color: #999;
    }

    .icon-job {
      display: inline-block;
      width: .3rem;
      height: .3rem;
      border-radius: 50%;
    }

    .list_info_wrapper {
      flex: 1;
      position: relative;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-left: .2rem;
    }
    .list_detail {
      line-height: .12rem;
      .list_name {
        line-height: .14rem;
        font-size: .16rem;
        font-weight: 600;
      }
      .list_detail_item {
        margin-top: .12rem;
        font-size: .12rem;
      }
      .list_detail_title {
        color: #999;
      }
      .list_detail_value {
        color: #3296FA;
        font-size: .14rem;
      }
    }
    .list_status {
      line-height: .12rem;
      font-size: .12rem;
    }
    .icon-right {
      position: absolute;
      top: 50%;
      right: -.1rem;
      z-index: 1;
      display: inline-block;
      width: .08rem;
      height: .14rem;
      transform: translate(100%, -50%);
    }
  }

</style>

