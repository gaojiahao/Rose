<template>
  <div class='tab'>
    <!-- 收起状态-->
    <div class='only-tab-item' @click="tabShow = !tabShow">
      <div class='tab-item-name'>{{choicedTab}}
        <p class="arrow" :class='tabShow ? "arrow_up" : "arrow_down" '>
          <x-icon type="ios-arrow-down" size="16"></x-icon>
        </p>
      </div>
    </div>
    <!--展开状态 -->
    <div class='all-tab-item' ref='tabItem' v-show='tabShow'>
      <div class='tab_wrapper'>
        <div class='tab-item-name' v-for='(item, index) in tabVal' :class='{active : index===activeTabIndex}'
             :key='index' @click="switchTab(item, index)">
          {{item.view_name}}
        </div>
      </div>
    </div>
  </div>
</template>
<script>
  import Bscroll from 'better-scroll'

  export default {
    data() {
      return {
        tabShow: false,
        choicedTab: '', //选中的值
        activeTabIndex: 0,
        tabScroll: null,
        startY: 0,
      }
    },
    props: {
      tabVal: { //所有tab值
        type: Array,
        default: []
      }
    },
    methods: {
      //切换tab传值
      switchTab(item, index) {
        this.choicedTab = item.view_name;
        this.activeTabIndex = index;
        this.tabShow = false;
        this.$emit('tab-click', item, index)
      }
    },
    watch: {
      tabVal: {//监听父组件的传值，赋初始值
        handler(val) {
          if (val.length) {
            this.choicedTab = val[0].view_name;
          }
        }
      },
      tabShow: { //监听展开tab列表展开状态，刷新bscroll
        handler(val) {
          if (val) {
            this.tabScroll.scrollTo(0, this.startY);
            this.$nextTick(() => {
              // 刷新BScroll，滚动到相应位置
              this.tabScroll.refresh();
            });
          } else {
            // 记录滚动位置
            this.startY = this.tabScroll.y
          }
        }
      }
    },
    created() {//当页面刷新时重新赋值
      if (this.tabVal.length) {
        this.choicedTab = this.tabVal[0].view_name;
      }
      this.$nextTick(() => {
        this.tabScroll = new Bscroll(this.$refs.tabItem, {
          click: true
        })
      })
    }
  }
</script>

<style lang="scss" scoped>
  //修改vux箭头
  .vux-x-icon {
    fill: rgb(117, 117, 117);
    vertical-align: middle;
  }

  .tab {
    width: 100%;
    border-bottom: 1px solid #e8e8e8;
    color: rgb(117, 117, 117);
    position: relative;
    //收起的tab
    .only-tab-item {
      text-align: center;
      position: relative;
      .tab-item-name {
        font-weight: bold;
        color: #757575;
        line-height: .44rem;
        .arrow {
          position: absolute;
          display: inline-block;
        }
        .arrow_up {
          transform: rotate(-180deg);
          -webkit-transform: rotate(-180deg);
        }
        .arrow_down {
          transform: rotate(0);
          -webkit-transform: rotate(0);
        }
      }
    }
    //展开的tab
    .all-tab-item {
      left: 0;
      // top: 45px;
      z-index: 10;
      width: 100%;
      height: 150px;
      overflow: hidden;
      text-align: center;
      position: absolute;
      border-bottom: 1px solid #e8e8e8;
      background: rgba(245, 245, 245, 0.95);
      .tab-item-name {
        line-height: 44px;
      }
      .active {
        background: #ddd;
      }
    }
  }
</style>

