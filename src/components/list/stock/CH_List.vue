<template>
  <div class="pages" ref='list'>
    <div class='content'>
      <slot name="nav"></slot>
      <div class="list_top">
        <!-- 搜索栏 -->
        <div class="tab-container" ref="tabContainer">
          <div class="tab-item" :class="{active: index === activeIndex}" v-for="(item, index) in listView"
               @click="tabClick(item, index)" ref="tabs" :key="index">
            {{item.view_name}}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {getListClassfiy, getViewList} from 'service/kmService'
import chList from 'mixins/chList'

const BASE_PARAMS = {
    page: 1,
    limit: 20,
    hasNext: true,
    listData: [],
  };

export default {
  data() {
    return {
      uniqueId : 1400,
      filterArr: [
          {"operator": "like", "value": "", "property": "cashCode"}
      ],
      listMap: {},
    }
  },
  mixins: [chList],
  computed: {
      // 当前滑块
      currentItem() {
        if(this.listView.length){
          let {view_id} = this.listView[this.activeIndex];
          return this.listMap[view_id];
        }
      },
      // 当前滚动容器
      currentScroll() {
        return this.$refs.bScroll[this.activeIndex]
      }
    },
    methods: {
      // tab切换
      tabClick(val, index) {
        if (index === this.activeIndex) {
          this.currentScroll.scrollTo(0, 0);
          return;
        }
        this.activeIndex = index;
        this.activeTab = val.view_name;
        this.calc_rel_code = val.calc_rel_code;
        this.view_id = val.view_id;
        this.currentScroll.scrollTo(0, 0);
        this.resetCondition();
        this.getList();
        this.listSwiper.slideTo(index);
      },
    }
}
</script>

<style lang='scss' scoped>
.list-container {
  height: calc(100% - .96rem);
  .list_wrapper {
    height: 100%;
    background-color: #fff;
  }
}

.tab-container {
  display: flex;
  align-items: center;
  padding: 0 .15rem;
  width: 100%;
  height: .46rem;
  color: #333;
  white-space: nowrap;
  overflow: auto;
  box-sizing: border-box;
  .tab-item {
    line-height: .14rem;
    font-size: .14rem;
    & + .tab-item {
      margin-left: .2rem;
    }
    padding-right: .15rem;
    &.active {
      line-height: .18rem;
      color: #3296FA;
      font-size: .18rem;
      font-weight: 600;
    }
  }
}
</style>
