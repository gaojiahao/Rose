<template>
  <div class="achievement-container">
    <r-search :filterList="filterList" @search='searchList'></r-search>
    <r-scroll :options="scrollOptions" :has-next="hasNext" :no-data="!hasNext && !listData.length"
              @on-pulling-up="onPullingUp" @on-pulling-down="onPullingDown" ref="bScroll">
      <list-item :item="item" v-for="(item, index) in listData" :key="index"
                 @click.native="goDetail(item, index)"></list-item>
    </r-scroll>
  </div>
</template>

<script>
  import RScroll from './common/RScroll'
  import ListItem from './common/ListItem'
  import RSearch from './common/RSearch'
  import {toFixed, accAdd} from '@/plugins/calc'
  import {getSalesList} from './../service/listService'

  export default {
    name: "achievement",
    components: {
      RScroll,
      ListItem,
      RSearch,
    },
    data() {
      return {
        page: 1,
        limit: 10,
        listData: [],
        filterList: [ // 过滤列表
          {
            name: '经办人',
            value: 'saleOwnerN',
          }, {
            name: '存货名称',
            value: 'INVENTORY_NAME',
          }, {
            name: '往来简称',
            value: 'DEALER_ABBREVIATION',
          },
        ],
        hasNext: true,
        serachVal: '',
        filterProperty: '',
        scrollOptions: {
          click: true,
          // pullDownRefresh: true,
          pullUpLoad: true,
        },
      }
    },
    watch: {
      $route: {
        handler(to, from) {
          if (to.name === 'Home') {
            from.meta.reload = true;
          }
        }
      }
    },
    methods: {
      getDefaultImg(item) {
        let url = require('@/assets/wl_default.png');
        if (item) {
          item.inventoryPic = url;
        }
        return url
      },
      // TODO 重置列表条件
      resetCondition() {
        this.listData = [];
        this.page = 1;
        this.hasNext = true;
        this.$nextTick(() => {
          this.$refs.bScroll.scrollTo(0, 0);
          this.$refs.bScroll.resetPullDown();
        })
      },
      // TODO 搜索
      searchList({val = '', property = ''}) {
        this.serachVal = val;
        this.filterProperty = property;
        this.resetCondition();
        this.getList();
      },
      // TODO 查询列表
      getList() {
        let filter = [];
        if (this.serachVal) {
          filter = [
            ...filter,
            {
              operator: "like",     //模糊查询like，精确查询eq
              property: this.filterProperty,
              value: this.serachVal
            }
          ];
        }
        return getSalesList({
          page: this.page,
          start: (this.page - 1) * this.limit,
          limit: this.limit,
          // filter: JSON.stringify(filter)
        }).then(({dataCount = 0, tableContent = []}) => {
          this.hasNext = dataCount > (this.page - 1) * this.limit + tableContent.length;
          this.listData = this.page === 1 ? tableContent : this.listData.concat(tableContent);
          this.$nextTick(() => {
            this.resetScroll();
          })
        })
      },
      // TODO 重置下拉刷新、上拉加载的状态
      resetScroll() {
        this.$refs.bScroll.finishPullDown();
        this.$refs.bScroll.finishPullUp();
      },
      // TODO 上拉加载
      onPullingUp() {
        this.page++;
        this.getList();
      },
      // TODO 下拉刷新
      onPullingDown() {
        this.page = 1;
        this.getList(true);
      },
      // TODO 进入详情页
      goDetail(item) {
        sessionStorage.setItem('RFD_ACHIEVEMENT_DETAIL', JSON.stringify(item));
        this.$router.push({
          path: '/achievementDetail'
        });
      }
    },
    created() {
      this.getList();
    },
    activated() {
      if (this.$route.meta.reload) {
        this.getList();
      }
    }
  }
</script>

<style scoped lang="scss">
  .achievement-container {
    position: relative;
    width: 100%;
    height: 100%;
    background-color: #fff;
    overflow: hidden;
    .scroll-container {
      height: calc(100% - .3rem);
    }
  }
</style>