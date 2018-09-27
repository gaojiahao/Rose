<template>
  <div class="pages user-list-container" ref='list'>
    <div class='content'>
      <div class="list_top">
        <!-- 搜索栏 -->
        <searchIcon :filterList="filterList" @search='searchList'></searchIcon>
      </div>
      <r-scroll class="list_wrapper" :options="scrollOptions" :has-next="hasNext"
                :no-data="!hasNext && !listData.length" @on-pulling-up="onPullingUp" @on-pulling-down="onPullingDown"
                ref="bScroll">
        <div class="each_duty" :class="{visited: item.visited}" v-for="(item, index) in listData" :key="index"
             @click='goDetail(item, index)'>
          <!-- 订单编号, 时间 -->
          <div class="duty_top">
            <p class="duty_code">{{item.userCode}}</p>
            <p class="duty_time">{{item.crtTime | dateFormat('YYYY-MM-DD')}}</p>
          </div>
          <div class="duty-item">
            {{item.nickname}}
          </div>
          <div class="order_count">
            <div class="handle_man">
              {{item.creator}}<span style="fontSize:.1rem;" v-if="item.creator">[创建人]</span>
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
  import {getAllUsers} from 'service/userService'
  import listCommon from './../mixins/bizListCommon'

  export default {
    name: 'USER_List',
    data() {
      return {
        listStatus: [{name: '全部', status: ''}, {name: '已生效', status: '已生效'}, {name: '进行中', status: '进行中'}],
        listViewID: 2192,
        filterList: [ // 过滤列表
          {
            name: '工号',
            value: 'userCode',
          }, {
            name: '姓名',
            value: 'nickname',
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
        let {transCode} = item;
        let {code} = this.$route.params;
        let {name} = this.$route.query;
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
              colId: item.colId
            }
          })
        }, 200)
      },
      // TODO 获取用户列表
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
        return getAllUsers({
          limit: this.limit,
          page: this.page,
          start: (this.page - 1) * this.limit,
          filter: JSON.stringify(filter)
        }).then(({dataCount = 0, tableContent = []}) => {
          this.$emit('input', false);
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
    },
    created() {
    }
  }
</script>

<style lang='scss' scoped>
  @import './../scss/bizList';

  .user-list-container {
    .list_wrapper {
      height: calc(100% - 1.2rem);
    }
    .duty-item {
      padding: 0 .1rem;
      height: .24rem;
      line-height: .24rem;
    }
  }
</style>
