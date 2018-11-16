<template>
  <div class='sort_part vux-1px-b'>
    <div class='each_sort' :class="{active: property === SItem.key}" v-for="(SItem, SIndex) in data" :key="SIndex"
         @click="sortClick(SItem, SIndex)">
      <span class='sort_name'>{{SItem.name}}</span>
      <span class='arrow' v-if="SItem.key">
          <i class='iconfont arrow_up'
             :class="[property === SItem.key && sort === 'ASC' ? 'active icon-shangsanjiao-copy' : 'icon-shangsanjiao']"></i>
          <i class='iconfont arrow_down'
             :class="[property === SItem.key && sort === 'DESC' ? 'active icon-sort-up-copy-copy' : 'icon-xiasanjiao1']"></i>
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
            { name: '综合', key: '' },
            { name: '交易号', key: 'transCode' },
            { name: '修改时间', key: 'modTime' },
            { name: '流程状态', key: 'processSort' }
          ]
        }
      }
    },
    data() {
      return {
        sort: '',     // 排序机制 （倒序 DESC / 正序 ACS）
        property: '', // 被选中的字段
      }
    },
    methods: {
      //排序
      sortClick(item, i) {
        if(this.property === item.key){
          // 排序转变
          this.sort = this.sort === 'ASC' 
            ? 'DESC'
            : 'ASC'
        }
        else{
          // 默认为正序
          this.sort = 'ASC' 
        }
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
    display: flex;
    height: 0.24rem;
    line-height: 0.24rem;
    padding: .1rem .15rem .1rem .05rem;
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
          font-size: .1rem;
          color: #757575;
          &.active {
            color: #5077aa;
            font-weight: bold;
          }
        }
        .arrow_up {
          top: -.02rem;
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
