<template>
  <div class="materiel_ct_list">
    <div class="title">
      <span class="iconfont icon-Shape"></span>物料列表
    </div>
    <div class="mater_list">
      <matter-item :item="item" v-for="(item, index) in matterList" :key='index'>
        <!-- 物料详情 -->
        <template slot="other" slot-scope="{item}">
          <slot name="matterOther" :item="item"></slot>
        </template>
      </matter-item>
    </div>
    <!-- 金额明细 -->
    <price-total :amt="noTaxAmount" :tax-amt="taxAmount" :count="count" v-if="count"></price-total>
  </div>
</template>

<script>
// vux组件引入
import { numberComma } from 'vux'
// 方法引入
import { toFixed } from '@/plugins/calc'
// 内部组件引入
import FormCell from 'components/detail/commonPart/FormCell'
import MatterItem from 'components/detail/commonPart/MatterItem'
import PriceTotal from 'components/detail/commonPart/PriceTotal'
export default {
  name: 'MatterList',
  props: {
    matterList: {
      type: Array,
      default: []
    },
    // 金额（不含税）
    noTaxAmount: {
      type: Number,
      default: 0
    },
    // 税金
    taxAmount: {
      type: Number,
      default: 0
    },
    // 合计
    count: {
      type: Number,
      default: 0
    },
  },
  components: {
    FormCell,  
    PriceTotal,
    MatterItem
  },
  filters: {
    toFixed,
    numberComma
  }
}
</script>
<style scoped lang="scss">
.materiel_ct_list {
  position: relative;
  background: #FFF;
  padding: .06rem .08rem;
  .title {
    color: #111;
    font-weight: bold;
    font-size: .16rem;
    .icon-Shape {
      font-size: .14rem;
      font-weight: normal;
    }
  }
}

</style>
