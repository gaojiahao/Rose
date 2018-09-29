<template>
  <div class="pages user-list-container" ref='list'>
    <div class='content'>
      <div class="list_top">
        <!-- 搜索栏 -->
        <searchIcon :filterList="filterList" @search='searchList'></searchIcon>
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
          <!-- 订单编号, 时间 -->
          <div class="duty_top">
            <p class="duty_code">{{item.userCode}}</p>
            <!--<p class="duty_time">{{item.crtTime | dateFormat('YYYY-MM-DD')}}</p>-->
          </div>
          <div class="duty-item">
            <img class="avatar" :src="item.photo" alt="头像" @error="getDefaultImg(item)">
            {{item.nickname}}
          </div>
          <div class="order_count">
            <div class="handle_man">
              {{item.creator}}<span style="fontSize:.1rem;" v-if="item.creator">[创建人]</span>
            </div>
          </div>
          <i class="iconfont icon-bianji" @click.stop="goUserEdit(item, index)"></i>
        </div>
      </r-scroll>
    </div>
    <div class="btn vux-1px-t">
      <div class="cfm_btn" @click="goEdit">新增</div>
    </div>
  </div>
</template>

<script>
  import {getAllUsers} from 'service/Directorys/userService'
  import listCommon from 'pageMixins/bizListCommon'
  // 映射表引入
  import Apps from '@/home/pages/apps/bizApp/maps/Apps'

  export default {
    name: 'USER_List',
    data() {
      return {
        listStatus: [
          {name: '全部', status: ''},
          {name: '使用中', status: 1},
          {name: '未使用', status: 2},
          {name: '停用', status: -1},
        ],
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
      // TODO 获取默认图片
      getDefaultImg(item) {
        let url = require('assets/ava01.png');
        if (item) {
          item.photo = url;
        }
        return url;
      },
      // TODO 页面跳转
      pathChange(item, index, path) {
        if (this.clickVisited) {
          return
        }
        // 交易号、应用名称等
        let {colId} = item;
        let {name} = this.$route.query;
        // 高亮 点击过的数据
        this.clickVisited = true;
        item.visited = true;
        this.$set(this.listData, index, {...item});
        // 等待动画结束后跳转
        setTimeout(() => {
          this.clickVisited = false;
          this.$router.push({
            path,
            query: {
              name,
              colId
            }
          })
        }, 200)
      },
      // TODO 跳转到详情
      goDetail(item, index) {
        let {code} = this.$route.params;
        this.pathChange(item, index, `/detail/${code}`);
      },
      // TODO 跳转到编辑
      goUserEdit(item, index) {
        let {code} = this.$route.params;
        this.pathChange(item, index, `/fillform/${Apps[code]}`);
      },
      // TODO 获取用户列表
      getList(noReset = false) {
        let filter = [];

        if (this.activeTab) {
          filter.push({
            operator: 'in',
            value: this.activeTab,
            property: 'status'
          })
        }

        if (this.serachVal) {
          filter = [
            ...filter,
            {
              operator: 'like',
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
          tableContent.forEach(item => {
            if (!item.photo) {
              item.photo = this.getDefaultImg();
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
      height: calc(100% - 1.68rem);
    }
    .each_duty {
      padding-right: .35rem;
      box-sizing: border-box;
      .icon-bianji {
        position: absolute;
        top: 50%;
        right: 0;
        width: .35rem;
        text-align: center;
        font-size: .24rem;
        transform: translateY(-50%);
      }
    }
    .duty-item {
      display: flex;
      align-items: center;
      padding: 0 .1rem;
      line-height: .24rem;
      .avatar {
        margin-right: .1rem;
        width: .6rem;
        height: .6rem;
      }
    }
  }
</style>
