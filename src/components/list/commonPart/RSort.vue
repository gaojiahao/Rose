<template>
  <div class='sort_part vux-1px-b'>
    <div class='each_sort' :class="{active: property === SItem.key}" v-for="(SItem, SIndex) in data" :key="SIndex"
         @click="sortClick(SItem,SIndex)">
      <span class='sort_name'>{{SItem.name}}</span>
      <span class='arrow' v-if="SItem.key">
          <i class='iconfont arrow_up'
             :class="[property === SItem.key && sort === 'ASC' ? 'icon-shangsanjiao-copy' : 'icon-shangsanjiao']"></i>
          <i class='iconfont arrow_down'
             :class="[property === SItem.key && sort === 'DESC' ? 'icon-sort-up-copy-copy' : 'icon-xiasanjiao1']"></i>
        </span>
    </div>
  </div>
</template>

<script>
  export default {
    name: "RSort",
    props: {
      data: {
        type: Array,
        default() {
          return [
            {name: '综合', key: ''},
            {name: '交易号', key: 'transCode'},
            {name: '修改时间', key: 'modTime'},
            {name: '流程状态', key: 'status'}
          ]
        }
      }
    },
    data() {
      return {
        property: '',
        sort: '',
      }
    },
    methods: {
      //排序
      sortClick(item, i) {
        this.sort = this.property === item.key ? (this.sort === 'ASC' ? 'DESC' : 'ASC') : 'ASC';
        this.property = item.key;

        this.$emit('on-sort', {
          property: item.key,
          direction: this.sort,
        });
      }
    }
  }
</script>

<style scoped lang="scss">
  .sort_part {
    padding: 0.1rem 0.15rem 0.1rem 0.05rem;
    display: flex;
    height: 0.24rem;
    line-height: 0.24rem;
    // align-items: center;
    .each_sort {
      flex: 1;
      display: flex;
      font-size: .14rem;
      box-sizing: border-box;
      justify-content: center;
      &.active {
        color: #5077aa;
        font-weight: bold;
      }
      .arrow {
        height: 100%;
        position: relative;
        .iconfont {
          font-size: 0.1rem;
          color: #757575;
          // height: 50%;
          &.icon-sort-up-copy-copy, .icon-shangsanjiao-copy {
            color: #5077aa;
          }
        }
        .arrow_up {
          top: -0.02rem;
          position: absolute;
        }
        .arrow_down {
          top: .04rem;
          position: absolute;
        }
      }
    }
  }
</style>
