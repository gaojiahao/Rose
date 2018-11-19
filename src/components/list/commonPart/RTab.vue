<template>
  <div class="tab-part vux-1px-b">
    <div class='each-tab' :class="{'active vux-1px' : TIndex === activeTabIndex}"
        v-for="(TItem, TIndex) in data" 
        :key="TIndex" @click="switchTab(TItem, TIndex)">
      <div class="tab_content">{{TItem.name}}</div>
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
    .each-tab {
      flex: 1;
      padding: .02rem 0;
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
