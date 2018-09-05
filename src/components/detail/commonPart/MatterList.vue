<template>
  <div class="materiel_list">
    <div class="title">
      <span class="iconfont icon-Shape"></span>物料列表
    </div>
    <div class="mater_list">
      <matter-item :item="item" :class="{'vux-1px-b' : index !== matterList.length - 1}" v-for="(item, index) in matterList"
                   :key='index'></matter-item>
    </div>
  </div>
</template>

<script>
  import MatterItem from 'components/detail/commonPart/MatterItem'
  import {numberComma} from 'vux'
  import {toFixed} from '@/plugins/calc'

  export default {
    name: 'MatterList',
    props: {
      matterList: {
        type: Array,
        default: []
      }
    },
    components: {
      MatterItem,
    },
    filters: {
      numberComma,
      toFixed,
    }
  }
</script>

<style scoped lang="scss">
  // 物料列表
  .materiel_list {
    position: relative;
    background: #FFF;
    padding: .06rem .08rem 0;
    .title {
      color: #111;
      font-weight: bold;
      font-size: .18rem;
    }
    .price_cell {
      padding: .08rem 0;
      .title {
        color: #757575;
        font-size: .14rem;
        font-weight: normal;
      }
      .symbol {
        font-size: .14rem;
      }
      .num {
        color: #c93d1b;
        font-size: .2rem;
        font-weight: bold;
      }
    }
    .icon-Shape {
      font-size: .14rem;
      font-weight: 200;
      margin-right: .02rem;
    }
    // 物料列表
    .mater_list {
      width: 100%;
      box-sizing: border-box;
    }
    .vux-1px-b:after {
      border-color: #e8e8e8;
    }
  }


</style>
