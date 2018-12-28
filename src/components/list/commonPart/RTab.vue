<template>
  <div class="tab-part vux-1px-b" :class="{'tab-part-2': mode === '2', 'tab-part-3': mode === '3'}">
    <div class='each-tab' :class="{'active vux-1px' : TIndex === activeTabIndex}" v-for="(TItem, TIndex) in data"
         :key="TIndex" @click="switchTab(TItem, TIndex)">
      {{TItem.name}}
    </div>
  </div>
</template>

<script>
  export default {
    name: "RTab",
    props: {
      data: {
        type: Array,
        default() {
          return [
            {name: '全部', status: ''},
            {name: '进行中', status: '进行中'},
            {name: '已生效', status: '已生效'},
            {name: '草稿', status: '草稿'},
          ]
        }
      },
      activeIndex: {
        type: Number,
        default: 0
      },
      mode: {
        type: String,
        default: '1'
      },
    },
    data() {
      return {
        activeTabIndex: 0, // 当前选中索引
      }
    },
    watch: {
      activeIndex: {
        handler(val) {
          this.activeTabIndex = val;
        },
        immediate: true
      }
    },
    methods: {
      // TODO 切换tab
      switchTab(item, index) {
        if (this.activeTabIndex === index) return;
        this.activeTabIndex = index;
        this.$emit('on-click', {
          ...item,
          index
        })
      },
    }
  }
</script>

<style scoped lang="scss">
  .vux-1px-b:after,
  .vux-1px-t:before {
    border-color: #e8e8e8;
  }

  .vux-1px:before {
    width: 197%;
    border-radius: 30px;
    border-color: #5077aa;
  }

  .tab-part {
    display: flex;
    padding: .1rem;
    justify-content: space-between;
    /* mode 2 */
    &.tab-part-2 {
      display: flex;
      // justify-content: center;
      &:after {
        border: none;
      }
      .each-tab {
        flex: 1;
        color: #a8a8a8;
        padding-bottom: .05rem;
        background-color: transparent;
        &.active {
          color: #000;
          &:before {
            border: none;
            border-radius: 0;
            border-bottom: 3px solid #ea5455;
          }
        }
      }
    }
    &.tab-part-3 {
      justify-content: flex-start;
      align-items: center;
      padding: 0 .15rem;
      height: .5rem;
      &:after {
        display: none;
      }
      .each-tab {
        flex: none;
        background-color: transparent;
        color: #999;
        font-size: .14rem;
        &.active {
          color: #333;
          transform: scale(1.3);
          transition: transform .3s;
          &:before {
            display: none;
          }
        }
        + .each-tab {
          margin-left: .15rem;
        }
      }
    }
    .each-tab {
      flex: 1;
      padding: .02rem 0;
      height: .24rem;
      line-height: .2rem;
      font-size: .12rem;
      text-align: center;
      border-radius: 30px;
      background: #f2f2f7;
      box-sizing: border-box;
      &.active {
        color: #5077aa;
        font-weight: bold;
      }
    }
    .each-tab + .each-tab {
      margin-left: .1rem;
    }
  }
</style>
