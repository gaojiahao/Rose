<template>
  <div class="tab_part vux-1px-b">
    <div class='each_tab' v-for="(TItem, TIndex) in data" :key="TIndex" @click="switchTab(TItem,TIndex)">
      <span :class="{'active' : TIndex === activeTabIndex}">{{TItem.name}}</span>
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
            {name: '已生效', status: '已生效'},
            {name: '进行中', status: '进行中'},
          ]
        }
      }
    },
    data() {
      return {
        activeTabIndex: 0, // 当前选中索引
      }
    },
    methods: {
      // TODO 切换tab
      switchTab(item, index) {
        if (this.activeTabIndex === index) {
          return
        }
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
  .vux-1px-b:after, .vux-1px-t:before {
    border-color: #e8e8e8;
  }

  .tab_part {
    padding: 0.07rem 0.1rem;
    display: flex;
    justify-content: space-between;
    .each_tab {
      width: 28%;
      text-align: center;
      span {
        display: block;
        height: 0.3rem;
        line-height: 0.3rem;
        // color: #666;
        background-color: #f2f2f7;
        border-radius: 0.3rem;
        font-size: 0.14rem;
        word-break: break-all;
        &.active {
          background-color: #5077aa;
          color: #fff;
        }
      }
    }
  }
</style>
